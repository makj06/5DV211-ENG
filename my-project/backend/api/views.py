from datetime import date

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import F
from django.db.models.functions import Least, Greatest
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .llm.llm_utils import run_llm_generation, run_llm_evaluation
from .llm.prompts import *
from .llm.topics import TOPICS
from .models import Knowledge, TopicStarted


# ==================================================
# Helper
# ==================================================

def recalc_user_stats(user):
    profile = user.profile

    profile.mastery_lvl = int(profile.mastery_unaided_solutions ** 0.5)

    profile.knowledge_lvl = sum(
        k.level for k in user.knowledge.all()
    ) / 2

    profile.success_rate = (
            profile.unaided_solutions / max(profile.problems_attempted, 1)
    )

    profile.mastery_rate = (
            profile.mastery_unaided_solutions /
            max(profile.mastery_problems_attempted, 1)
    )

    profile.performance = (
            profile.success_rate * profile.knowledge_lvl
            + profile.mastery_rate * profile.mastery_lvl
    )

    profile.engagement = 1 / max(profile.longest_days_inactive, 1)

    profile.mastery_progress = (
                                   profile.mastery_unaided_solutions - profile.mastery_lvl ** 2
                           ) / (profile.mastery_lvl * 2 + 1)

    profile.save()


def build_token_response(user):
    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "username": user.username,
        "userId": user.id,
    }


# ==================================================
# Signup
# ==================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_user(request):
    username = request.data.get("username")
    password = request.data.get("password") or ""

    if not username or not username.isalnum():
        return Response({"error": "Username invalid"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username taken"}, status=409)

    user = User.objects.create_user(
        username=username,
        password=password
    )

    for topic in TOPICS.keys():
        Knowledge.objects.create(user=user, topic=topic, level=0)

    return Response({
        "message": "User created",
        **build_token_response(user),
    }, status=201)


# ==================================================
# Login
# ==================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    profile = user.profile

    if user.last_login:
        days_inactive = (date.today() - user.last_login.date()).days - 1
        if days_inactive > profile.longest_days_inactive:
            profile.longest_days_inactive = days_inactive

    profile.save()
    recalc_user_stats(user)

    return Response({
        "message": "Login successful",
        **build_token_response(user),
    })


# ==================================================
# Logout
# ==================================================
# Expects:
# {
#   "refresh": "<refresh_token>"
# }

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response({"error": "Refresh token is required"}, status=400)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return Response({"error": "Invalid or expired refresh token"}, status=400)

    return Response({"message": "Logged out"})


# ==================================================
# Get Current User
# ==================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user
    profile = user.profile

    knowledge = {k.topic: k.level for k in user.knowledge.all()}

    return Response({
        "username": user.username,
        "userId": user.id,
        "knowledge": knowledge,
        "mastery_lvl": profile.mastery_lvl,
        "mastery_progress": profile.mastery_progress,
        "topics_started": [
            t.topic for t in user.topics_started.all()
        ]
    })


# ==================================================
# Load Task
# ==================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def load_task(request):
    user = request.user
    topic = request.data.get("topic")
    language = request.data.get("language")

    if topic not in TOPICS:
        return Response({"error": "Topic does not exist"}, status=400)

    knowledge_levels = {k.topic: k.level for k in user.knowledge.all()}

    if topic == "mastery":
        topic_list = "\n".join(
            f"- {name} ({data['description']})"
            for name, data in TOPICS.items()
        )

        prompt = Mastery_prompt_TEMPLATE.format(
            topic_list=topic_list,
            mastery_solved=user.profile.mastery_unaided_solutions
        )
    else:
        prompt = Question_prompt_TEMPLATE.format(
            topic=topic,
            details=TOPICS[topic]["description"],
            level=min(knowledge_levels[topic] + 1, 5),
            example=TOPICS[topic]["example"]
        )

    instructions = build_instructions(
        QuestionLLM_instructions,
        language=language
    )

    response, _ = run_llm_generation(
        instructions,
        prompt,
        response_format=QuestionSchema
    )

    user.profile.llm_task_calls += 1
    user.profile.save()

    TopicStarted.objects.get_or_create(user=user, topic=topic)

    return Response(response.question)


# ==================================================
# Chatbot
# ==================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def message_chatbot(request):
    user = request.user
    message = request.data.get("message", "")
    response_id = request.data.get("response_id")
    current_task = request.data.get("current_task", "")

    instructions = build_instructions(ChatLLM_instructions)

    if current_task:
        user_input = (
            "CURRENT_MATH_TASK:\n"
            f"{current_task}\n\n"
            "STUDENT_MESSAGE:\n"
            f"{message}"
        )
    else:
        user_input = (
            "STUDENT_MESSAGE:\n"
            f"{message}"
        )

    response, new_response_id = run_llm_generation(
        instructions,
        user_input,
        previous_response_id=response_id
    )
    if response_id:
        user.profile.llm_chat_calls += 1
        user.profile.save()

    return Response({
        "reply": response,
        "response_id": new_response_id
    })


# ==================================================
# Evaluate Solution
# ==================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def eval_solution(request):
    user = request.user
    profile = user.profile

    solution = request.data.get("solution")
    task = request.data.get("task")
    topic = request.data.get("topic")
    failed = request.data.get("has_failed")
    chatted = request.data.get("has_chatted")
    language = request.data.get("language")

    prompt = f"Question: {task}\nStudent's answer: {solution}"

    instructions = build_instructions(
        EvaluationLLM_instructions,
        language=language
    )

    response, _ = run_llm_evaluation(
        instructions,
        prompt,
        response_format=EvaluatingSchema
    )

    profile.llm_eval_calls += 1

    if topic == "mastery" and not failed:
        profile.mastery_problems_attempted += 1
        if response.correct:
            profile.mastery_unaided_solutions += 1

    elif not failed:
        profile.problems_attempted += 1

        if response.correct and not chatted:
            profile.unaided_solutions += 1
            Knowledge.objects.filter(
                user=user,
                topic=topic
            ).update(level=Least(F("level") + 1, 5))

        elif not response.correct:
            Knowledge.objects.filter(
                user=user,
                topic=topic
            ).exclude(level=5).update(
                level=Greatest(F("level") - 1, 0))

    profile.save()
    recalc_user_stats(user)

    return Response(response.model_dump())


# ==================================================
# Admin: Get All Users
# ==================================================

@api_view(['GET'])
def get_all_users(request):

    username = request.data.get("username")
    passhash = request.data.get("password") or ""
    if not username or not username.isalnum():
        return Response({"error": "Username invalid"}, status=400)
    if username != "adminimda" or passhash != "adminimda":
        return Response({"error": "Access denied"}, status=403)
    users = User.objects.all()
    result = {}

    for user in users:
        profile = user.profile

        knowledge = {
            k.topic: k.level for k in user.knowledge.all()
        }

        result[user.username] = {
            "last_login": user.last_login,
            "longest_days_inactive": profile.longest_days_inactive,
            "llm_chat_calls": profile.llm_chat_calls,
            "llm_task_calls": profile.llm_task_calls,
            "llm_eval_calls": profile.llm_eval_calls,
            "problems_attempted": profile.problems_attempted,
            "unaided_solutions": profile.unaided_solutions,
            "mastery_problems_attempted": profile.mastery_problems_attempted,
            "mastery_unaided_solutions": profile.mastery_unaided_solutions,
            "knowledge": knowledge,
            "mastery_lvl": profile.mastery_lvl,
            "mastery_progress": profile.mastery_progress,
            "knowledge_lvl": profile.knowledge_lvl,
            "success_rate": profile.success_rate,
            "mastery_rate": profile.mastery_rate,
            "performance": profile.performance,
            "engagement": profile.engagement,
            "topics_started": [
                t.topic for t in user.topics_started.all()
            ]
        }

    return Response(result)