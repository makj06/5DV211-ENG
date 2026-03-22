from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("signup/", views.signup_user),
    path("login/", views.login_user),
    path("logout/", views.logout_user),

    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("user/", views.get_user),
    path("users/", views.get_all_users),
    path("task/", views.load_task),
    path("chat/", views.message_chatbot),
    path("eval/", views.eval_solution),
]