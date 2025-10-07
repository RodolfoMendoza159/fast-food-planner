# In core/serializers.py

from rest_framework import serializers
from .models import User, Restaurant, MenuItem, Profile, MacroTracker

# --- User & Profile Serializers (Restored) ---
# These are needed by your user registration and login views.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['calorie_goal']

class MacroTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MacroTracker
        fields = '__all__'


# --- Restaurant & Menu Serializers (Updated) ---
# These are for displaying the restaurant and menu data.
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        # You can add or remove fields here as needed
        fields = ['id', 'name', 'category', 'calories', 'protein', 'fat', 'carbohydrates']

class RestaurantSerializer(serializers.ModelSerializer):
    # This automatically includes the menu items when fetching a restaurant's details
    menu_items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'menu_items']