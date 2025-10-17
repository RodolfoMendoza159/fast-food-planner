from rest_framework import generics, status, viewsets 
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User, Restaurant, MenuItem, Profile, MacroTracker
from .serializers import UserSerializer, RestaurantSerializer, MenuItemSerializer, ProfileSerializer, MacroTrackerSerializer
from django.shortcuts import get_object_or_404
from datetime import date
from django.views.generic import TemplateView
from django.db.models import F
from django.db import models

# --- User Management Views ---

# This function handles the logic for registering a new user.
@api_view(['POST'])
@permission_classes([AllowAny]) # R: It's set to [AllowAny] so that anyone can create an account.
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        # Using create_user ensures the password gets properly hashed.
        user = User.objects.create_user(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password']
        )
        # R: Upon successful registration, I also create the associated Profile
        # and MacroTracker objects so they're ready to be used.
        Profile.objects.create(user=user)
        MacroTracker.objects.create(user=user)
        
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

# --- NEW: Profile Management View ---
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_user_profile(request):
    """
    Handles fetching and updating the user's profile.
    - GET: Returns the current user's calorie_goal.
    - PUT: Updates the user's calorie_goal.
    """
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        # This is a fallback, though a profile is created at registration.
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

# I'm using a ViewSet here because it's the standard for providing
# both a list view and a detail view for a model.
class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated] # R: Only authenticated users can see the restaurants.

# --- Meal Logging and Tracking Views ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_tracker(request):
    # R: This view finds or creates a tracker for the current user for today's date.
    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_meal(request):
    # R: Expects a list of menu item IDs in the request body, e.g., {'item_ids': [1, 5, 12]}
    item_ids = request.data.get('item_ids', [])
    
    if not item_ids:
        return Response({'error': 'No items to log.'}, status=status.HTTP_400_BAD_REQUEST)

    # R: This fetches all the MenuItem objects from the database that match the provided IDs.
    items_to_log = MenuItem.objects.filter(id__in=item_ids)
    
    # R: I'm using Django's aggregate function to calculate the sum of all nutritional values
    # in a single, efficient database query. It's much faster than looping in Python.
    totals = items_to_log.aggregate(
        total_calories=models.Sum('calories'),
        total_protein=models.Sum('protein'),
        total_carbs=models.Sum('carbohydrates'),
        total_fat=models.Sum('fat')
    )

    # Get or create the tracker for today
    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    
    # Update the tracker's values efficiently
    # R: I'm using F() expressions to update the tracker. This is a safe way to handle
    # the update directly in the database, avoiding potential race conditions.
    tracker.calories_consumed = F('calories_consumed') + (totals['total_calories'] or 0)
    tracker.protein_consumed = F('protein_consumed') + (totals['total_protein'] or 0)
    tracker.carbs_consumed = F('carbs_consumed') + (totals['total_carbs'] or 0)
    tracker.fat_consumed = F('fat_consumed') + (totals['total_fat'] or 0)
    tracker.save()
    
    # Refresh the tracker from the DB to get the updated values
    tracker.refresh_from_db()

    # Finally, send the updated tracker data back to the frontend so the UI can update.
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meal_history(request):
    """
    Retrieves all past meal trackers for the authenticated user,
    ordered from newest to oldest.
    """
    # R: This line fetches all MacroTracker entries for the logged-in user.
    history = MacroTracker.objects.filter(user=request.user).order_by('-date')
    
    # R: The serializer converts the data into JSON format for the frontend.
    serializer = MacroTrackerSerializer(history, many=True)
    
    return Response(serializer.data)

