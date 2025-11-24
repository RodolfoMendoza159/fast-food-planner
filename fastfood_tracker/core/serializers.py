# In core/serializers.py

from rest_framework import serializers
# R: Make sure all models, including the new ones, are imported
from .models import (
    User, Restaurant, MenuItem, Profile, 
    FavoriteMeal, LoggedMeal, LoggedMealItem
)

# --- User & Profile Serializers (No Change) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['calorie_goal', 'about_me', 'favorite_food']

# --- Restaurant & Menu Serializers (No Change) ---
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'category', 'serving_size', 'calories', 'fat', 'sat_fat', 'trans_fat', 'cholesterol', 'sodium', 'carbohydrates', 'fiber', 'sugar', 'protein']

class RestaurantSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'menu_items']

# --- Favorite Meal Serializer (No Change) ---
class FavoriteMealSerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = FavoriteMeal
        fields = ['id', 'name', 'items']


# --- (REMOVED) Old Tracker Serializer ---
# The MacroTrackerSerializer is no longer needed.


# --- (NEW) Serializers for New History/Logging Models ---

class LoggedMealItemSerializer(serializers.ModelSerializer):
    """
    Serializes a single item within a logged meal, showing its
    quantity and full menu item details.
    """
    menu_item = MenuItemSerializer(read_only=True)
    
    class Meta:
        model = LoggedMealItem
        fields = ['menu_item', 'quantity']

class LoggedMealSerializer(serializers.ModelSerializer):
    """
    Serializes a "meal event," including the time it was created
    and all the items + quantities that were part of it.
    """
    # 'logged_items' is the 'related_name' from the LoggedMealItem model
    logged_items = LoggedMealItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = LoggedMeal
        fields = ['id', 'name', 'created_at', 'logged_items']