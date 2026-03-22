from llm_utils import run_llm_generation
from prompts import QuestionLLM_instructions, QuestionSchema, Question_prompt_TEMPLATE, build_instructions
from topics import TOPICS

topic = input("Enter topic (e.g. Fractions): ")
level = input("Enter level (1–5): ")
lang = input("Language: ")
if lang.lower() not in ["english", "swedish"] : lang = None

if not(topic.lower() in TOPICS):
        topic = "multiplication"

prompt = Question_prompt_TEMPLATE.format(
            topic=topic,
            details=TOPICS[topic]["description"],
            level=level,
            example=TOPICS[topic]["example"]
        )

response, _ = run_llm_generation(build_instructions(QuestionLLM_instructions,lang), prompt, response_format=QuestionSchema)
print(response.question)
print(response.answer)

