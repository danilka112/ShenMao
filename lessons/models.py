from django.db import models
from django.contrib.auth.models import User

class Lesson(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title

class Word(models.Model):
    chinese_character = models.CharField(max_length=16)
    pinyin = models.CharField(max_length=64)
    translation = models.CharField(max_length=128)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.chinese_character} ({self.pinyin}): {self.translation}"

class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    date_earned = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
