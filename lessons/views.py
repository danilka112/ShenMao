from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from .models import Lesson, Word, Achievement, UserAchievement
from .serializers import LessonSerializer, WordSerializer, AchievementSerializer, UserAchievementSerializer
from .word_generator import generate_words
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers_auth import RegisterSerializer, LoginSerializer
from django.contrib.auth import login
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

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

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            login(request, user)
            return Response({'token': token.key})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "username": user.username,
        })

class UserAchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_achievements = UserAchievement.objects.filter(user=request.user)
        return Response(UserAchievementSerializer(user_achievements, many=True).data)

class AllAchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        achievements = Achievement.objects.all()
        return Response(AchievementSerializer(achievements, many=True).data)

class UserPointsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_achievements = UserAchievement.objects.filter(user=request.user)
        total_points = sum(ua.achievement.points for ua in user_achievements)
        return Response({'points': total_points})

class GrantAchievementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        achievement_id = request.data.get('achievement_id')
        if not achievement_id:
            return Response({'error': 'achievement_id required'}, status=400)
        achievement = Achievement.objects.filter(id=achievement_id).first()
        if not achievement:
            return Response({'error': 'Achievement not found'}, status=404)
        ua, created = UserAchievement.objects.get_or_create(
            user=request.user, achievement=achievement
        )
        return Response({'granted': created})
