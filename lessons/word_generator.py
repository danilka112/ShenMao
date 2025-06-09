import random
from django.http import JsonResponse
from .models import Word

def generate_words():
    words = list(Word.objects.all())
    if not words:
        return []
    selected = random.sample(words, k=min(3, len(words)))
    return [
        {
            "chinese_character": w.chinese_character,
            "pinyin": w.pinyin,
            "translation": w.translation
        }
        for w in selected
    ]

def generate_words_view(request):
    try:
        words = generate_words()
        return JsonResponse(words, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)