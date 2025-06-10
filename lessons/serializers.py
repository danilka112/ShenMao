from rest_framework import serializers
from .models import Lesson, Word, Achievement, UserAchievement

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['id', 'chinese_character', 'pinyin', 'translation']

class LessonSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'words']

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'points']

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer()
    class Meta:
        model = UserAchievement
        fields = ['achievement', 'date_earned']