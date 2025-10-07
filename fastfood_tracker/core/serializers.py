from rest_framework import serializers
from .models import Restaurant, MenuItem, Profile, MacroTracker, User

# This will handle the serialization for the built-in User model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# This will convert Restaurant objects to JSON
class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name']

# This will convert MenuItem objects to JSON
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'restaurant', 'name', 'calories', 'protein', 'carbs', 'fats']

# This will convert Profile objects to JSON
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'calorie_goal']

# This will convert MacroTracker objects to JSON
class MacroTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MacroTracker
        fields = ['id', 'user', 'date', 'calories_consumed', 'protein_consumed', 'carbs_consumed', 'fats_consumed']