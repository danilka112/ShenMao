from django.db import models

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
