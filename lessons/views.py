from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from .models import Lesson, Word
from .serializers import LessonSerializer, WordSerializer
from .word_generator import generate_words

# Create your views here.

def generate_words_view(request):
    try:
        words = generate_words()
        return JsonResponse(words, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        lesson_data = LessonSerializer(instance).data
        lesson_data['words'] = generate_words()
        return JsonResponse(lesson_data, safe=False, json_dumps_params={"ensure_ascii": False})

class WordViewSet(viewsets.ModelViewSet):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
