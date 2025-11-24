# In core/views.py

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from datetime import date
from django.db.models import F, Sum
from django.db import models
from django.utils import timezone 

# --- NEW IMPORTS for Search/Sort ---
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

# --- UPDATED MODEL IMPORTS ---
# Replaced MacroTracker with LoggedMeal and LoggedMealItem
from .models import (
    User, Restaurant, MenuItem, Profile, 
    FavoriteMeal, LoggedMeal, LoggedMealItem
)

# --- UPDATED SERIALIZER IMPORTS ---
# Added new serializers
from .serializers import (
    UserSerializer, RestaurantSerializer, ProfileSerializer, 
    FavoriteMealSerializer, MenuItemSerializer, 
    LoggedMealSerializer, LoggedMealItemSerializer
)


# --- User Management Views (No Change) ---
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

# --- Profile Management View (No Change) ---
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

# --- Restaurant View (No Change) ---
class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

# --- NEW: MenuItem ViewSet for Search/Sort/Filter ---
class MenuItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for searching, filtering, and sorting menu items.
    """
    queryset = MenuItem.objects.all().select_related('restaurant')
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    
    filterset_fields = ['restaurant', 'category']
    search_fields = ['name', 'category']
    ordering_fields = ['name', 'calories', 'protein', 'fat', 'carbohydrates']


# --- (REPLACED) Meal Logging and Tracking Views ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_tracker(request):
    """
    Calculates and returns the macro totals for the current day.
    """
    today = timezone.now().date()
    
    items_today = LoggedMealItem.objects.filter(
        logged_meal__user=request.user,
        logged_meal__created_at__date=today
    ).select_related('menu_item')
    
    totals = { 'calories': 0, 'protein': 0, 'fat': 0, 'carbs': 0 }
    
    for item in items_today:
        totals['calories'] += item.menu_item.calories * item.quantity
        totals['protein'] += item.menu_item.protein * item.quantity
        totals['fat'] += item.menu_item.fat * item.quantity
        totals['carbs'] += item.menu_item.carbohydrates * item.quantity

    try:
        goal = request.user.profile.calorie_goal
    except Profile.DoesNotExist:
        goal = 2000 # Default

    return Response({
        'goal': goal,
        'consumed': totals,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_meal(request):
    """
    Logs a new individual meal with items and quantities.
    Expects data like: 
    { 
      "name": "Lunch", 
      "items": [{"id": 5, "quantity": 1}, {"id": 22, "quantity": 2}] 
    }
    """
    items_data = request.data.get('items', [])
    meal_name = request.data.get('name') # Optional

    if not items_data:
        return Response({'error': 'No items to log.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_meal = LoggedMeal.objects.create(user=request.user, name=meal_name)
        
        items_to_create = []
        for item_data in items_data:
            menu_item = MenuItem.objects.get(id=item_data['id'])
            items_to_create.append(
                LoggedMealItem(
                    logged_meal=new_meal,
                    menu_item=menu_item,
                    quantity=item_data.get('quantity', 1)
                )
            )
        
        LoggedMealItem.objects.bulk_create(items_to_create)
        
        serializer = LoggedMealSerializer(new_meal)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except MenuItem.DoesNotExist:
        return Response({'error': 'One or more menu items not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meal_history(request):
    """
    Returns a list of all LoggedMeal events, newest first.
    """
    history = LoggedMeal.objects.filter(user=request.user).order_by('-created_at')
    serializer = LoggedMealSerializer(history, many=True)
    return Response(serializer.data)

# --- Favorite Meal ViewSet (Updated log action) ---
class FavoriteMealViewSet(viewsets.ModelViewSet):
    queryset = FavoriteMeal.objects.all()
    serializer_class = FavoriteMealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        item_ids = self.request.data.get('item_ids', [])
        favorite_meal = serializer.save(user=self.request.user)
        favorite_meal.items.set(item_ids)

    # --- THIS FUNCTION IS NOW FIXED ---
    @action(detail=True, methods=['post'])
    def log(self, request, pk=None):
        """
        Logs a favorite meal to the new history system.
        """
        favorite_meal = self.get_object()
        items_to_log = favorite_meal.items.all()
        
        if not items_to_log:
            return Response({'error': 'This favorite meal has no items to log.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the parent meal "event"
        new_meal = LoggedMeal.objects.create(user=request.user, name=favorite_meal.name)
        
        items_to_create = [
            LoggedMealItem(
                logged_meal=new_meal,
                menu_item=item,
                quantity=1 # Favorite meals default to quantity 1
            ) for item in items_to_log
        ]
        
        LoggedMealItem.objects.bulk_create(items_to_create)
        
        serializer = LoggedMealSerializer(new_meal)
        return Response(serializer.data, status=status.HTTP_201_CREATED)