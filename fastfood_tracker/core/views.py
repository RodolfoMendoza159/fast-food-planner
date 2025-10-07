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

# --- User Management Views ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Handles new user registration.
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password']
        )
        # Create a profile and macro tracker for the new user
        Profile.objects.create(user=user)
        MacroTracker.objects.create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Handles user login and returns an authentication token.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

# --- Data Endpoints ---

# THIS REPLACES BOTH RestaurantListView AND RestaurantDetailView
class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This ViewSet automatically provides `list` and `retrieve` actions.
    """
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    #permission_classes = [IsAuthenticated]

# --- Core App Logic ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_tracker(request):
    """
    Gets the user's macro tracker for the current day.
    """
    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_meal(request):
    """
    Logs a meal by adding its nutritional values to the daily tracker.
    Expects a list of menu item IDs in the request: {'menu_item_ids': [1, 5, 12]}
    """
    menu_item_ids = request.data.get('menu_item_ids', [])
    if not menu_item_ids:
        return Response({'error': 'No menu items provided.'}, status=status.HTTP_400_BAD_REQUEST)

    items_to_log = MenuItem.objects.filter(id__in=menu_item_ids)
    
    total_calories = sum(item.calories for item in items_to_log)
    total_protein = sum(item.protein for item in items_to_log)
    total_carbs = sum(item.carbs for item in items_to_log)
    total_fats = sum(item.fats for item in items_to_log)

    tracker, created = MacroTracker.objects.get_or_create(user=request.user, date=date.today())
    
    tracker.calories_consumed += total_calories
    tracker.protein_consumed += total_protein
    tracker.carbs_consumed += total_carbs
    tracker.fats_consumed += total_fats
    tracker.save()
    
    serializer = MacroTrackerSerializer(tracker)
    return Response(serializer.data, status=status.HTTP_200_OK)

class IndexView(TemplateView):
    template_name = 'index.html'