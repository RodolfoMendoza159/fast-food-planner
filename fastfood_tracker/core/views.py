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
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# This handles the login process. It takes username/password, and if they're
# valid, it returns the user's authentication token.
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

# --- Data Endpoints ---

# R: THIS REPLACES BOTH RestaurantListView AND RestaurantDetailView
# I used a ViewSet here because it's a very clean and efficient way to provide
# both a list of all restaurants and the details for a single restaurant.
# It automatically handles the logic for `/api/restaurants/` and `/api/restaurants/1/`.
class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This ViewSet automatically provides `list` and `retrieve` actions.
    """
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    # R: UPDATE: I changed this from IsAuthenticated to AllowAny during debugging.
    permission_classes = [AllowAny]
    #permission_classes = [IsAuthenticated]

# --- Core App Logic ---

# This view is for fetching the user's macro data for the current day.
# R :(FUTURE PLAN) This could be expanded to fetch data for a specific date,
# allowing for a history/calendar view in the frontend.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_tracker(request):
    """
    Gets the user's macro tracker for the current day.
    """
    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data)

# This is the main logic for the app. It receives a list of menu item IDs from the frontend.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_meal(request):
    menu_item_ids = request.data.get('menu_item_ids', [])
    if not menu_item_ids:
        return Response({'error': 'No menu items provided.'}, status=status.HTTP_400_BAD_REQUEST)

    items_to_log = MenuItem.objects.filter(id__in=menu_item_ids)
    
    # Calculate totals from the selected items
    # R: I'm using .aggregate() here to calculate the sum of all nutritional values
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

# This view is for serving the main React index.html file.
class IndexView(TemplateView):
    template_name = 'index.html'