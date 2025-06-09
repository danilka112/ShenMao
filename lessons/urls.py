from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet, WordViewSet, generate_words_view

router = DefaultRouter()
router.register(r'lessons', LessonViewSet)
router.register(r'words', WordViewSet)

urlpatterns = [
    # Здесь будут маршруты для приложения lessons
]

urlpatterns += router.urls

urlpatterns += [
    path('generate_words/', generate_words_view, name='generate_words'),
]