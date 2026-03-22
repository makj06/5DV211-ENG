from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    longest_days_inactive = models.IntegerField(default=0)

    llm_chat_calls = models.IntegerField(default=0)
    llm_task_calls = models.IntegerField(default=0)
    llm_eval_calls = models.IntegerField(default=0)

    problems_attempted = models.IntegerField(default=0)
    unaided_solutions = models.IntegerField(default=0)

    mastery_problems_attempted = models.IntegerField(default=0)
    mastery_unaided_solutions = models.IntegerField(default=0)

    knowledge_lvl = models.FloatField(default=0)
    success_rate = models.FloatField(default=0)
    mastery_rate = models.FloatField(default=0)
    mastery_progress = models.FloatField(default=0)
    mastery_lvl = models.IntegerField(default=0)
    performance = models.FloatField(default=0)
    engagement = models.FloatField(default=1)

    def __str__(self):
        return f"Profile of {self.user.username}"


class Knowledge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="knowledge")
    topic = models.CharField(max_length=50)
    level = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "topic")


class TopicStarted(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="topics_started")
    topic = models.CharField(max_length=50)

    from django.db.models.signals import post_save
from django.dispatch import receiver

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, raw=False, **kwargs):
    if raw:
        return
    if created:
        Profile.objects.create(user=instance)