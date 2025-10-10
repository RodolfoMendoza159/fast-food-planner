# In core/serializers.py

from rest_framework import serializers
from .models import User, Restaurant, MenuItem, Profile, MacroTracker

# --- User & Profile Serializers ---
# This serializer handles the data for new user registration.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}} # R: I set the password to 'write_only' so it's never sent back in an API response.

# A simple serializer for the user's profile data.
# R: (FUTURE PLAN) If I add more fields to the Profile model, add them here too.
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['calorie_goal']

# This serializer can show all fields for the daily tracker.
# It's used to send the user's updated totals back to the frontend after logging a meal.
class MacroTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MacroTracker
        fields = '__all__'


# --- Restaurant & Menu Serializers ---
# This serializer defines exactly which fields from the MenuItem model
# should be included in the API response.
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        # I listed all the nutritional fields to make sure the frontend
        # has all the data it needs to display details and calculate totals.
        fields = [
            'id', 'name', 'category', 'serving_size', 'calories', 'fat',
            'sat_fat', 'trans_fat', 'cholesterol', 'sodium',
            'carbohydrates', 'fiber', 'sugar', 'protein'    #R: (FUTURE PLAN) If we ever need to add some Ex. Allergens
        ]

class RestaurantSerializer(serializers.ModelSerializer):
    # R: This is a key feature,  I've nested the MenuItemSerializer here.
    # This means when the frontend asks for a single restaurant's details,
    # the JSON response will automatically include a full list of its menu items.
    # It's very efficient and saves the frontend from having to make a second API call.
    menu_items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'menu_items']