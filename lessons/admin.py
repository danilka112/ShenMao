from django.contrib import admin
from .models import Lesson, Word

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'description')

@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ('chinese_character', 'pinyin', 'translation', 'lesson')
