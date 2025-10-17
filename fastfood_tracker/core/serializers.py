# In core/serializers.py
from rest_framework import serializers
from .models import User, Restaurant, MenuItem, Profile, MacroTracker

# --- (User, Profile, and Restaurant Serializers are unchanged) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['calorie_goal']

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'category', 'serving_size', 'calories', 'fat', 'sat_fat', 'trans_fat', 'cholesterol', 'sodium', 'carbohydrates', 'fiber', 'sugar', 'protein']

class RestaurantSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'menu_items']


# --- UPDATED TRACKER SERIALIZER ---
class MacroTrackerSerializer(serializers.ModelSerializer):
    # R: This now directly includes the list of menu items for the day.
    # This is much cleaner than the previous nested approach.
    items = MenuItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = MacroTracker
        fields = ['id', 'date', 'calories_consumed', 'protein_consumed', 'fat_consumed', 'carbs_consumed', 'items']