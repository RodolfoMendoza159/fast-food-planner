# In core/views.py

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User, Restaurant, MenuItem, Profile, MacroTracker
from .serializers import UserSerializer, RestaurantSerializer, ProfileSerializer, MacroTrackerSerializer
from datetime import date
from django.db.models import F, Sum
from django.db import models

# --- User Management Views ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password']
        )
        Profile.objects.create(user=user)
        token = Token.objects.create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)


# --- Profile Management View ---

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_user_profile(request):
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Restaurant and Menu Views ---

class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

# --- Meal Logging and Tracking Views ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_tracker(request):
    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_meal(request):
    item_ids = request.data.get('item_ids', [])
    if not item_ids:
        return Response({'error': 'No items to log.'}, status=status.HTTP_400_BAD_REQUEST)
    
    items_to_log = MenuItem.objects.filter(id__in=item_ids)
    totals = items_to_log.aggregate(
        total_calories=Sum('calories', default=0),
        total_protein=Sum('protein', default=0),
        total_carbs=Sum('carbohydrates', default=0),
        total_fat=Sum('fat', default=0)
    )
    
    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    
    tracker.items.add(*items_to_log)
    
    tracker.calories_consumed = F('calories_consumed') + totals['total_calories']
    tracker.protein_consumed = F('protein_consumed') + totals['total_protein']
    tracker.carbs_consumed = F('carbs_consumed') + totals['total_carbs']
    tracker.fat_consumed = F('fat_consumed') + totals['total_fat']
    tracker.save()
    
    tracker.refresh_from_db()
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meal_history(request):
    history = MacroTracker.objects.filter(user=request.user).order_by('-date')
    serializer = MacroTrackerSerializer(history, many=True)
    return Response(serializer.data)