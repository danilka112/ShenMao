from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet, WordViewSet, generate_words_view, RegisterView, LoginView, UserInfoView, UserAchievementsView, AllAchievementsView, UserPointsView, GrantAchievementView

router = DefaultRouter()
router.register(r'lessons', LessonViewSet)
router.register(r'words', WordViewSet)

urlpatterns = [
]

urlpatterns += router.urls

urlpatterns += [
    path('generate_words/', generate_words_view, name='generate_words'),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('me/', UserInfoView.as_view()),
    path('my_achievements/', UserAchievementsView.as_view()),
    path('all_achievements/', AllAchievementsView.as_view()),
    path('my_points/', UserPointsView.as_view()),
    path('grant_achievement/', GrantAchievementView.as_view()),
]