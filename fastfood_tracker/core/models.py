from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# The standard User model for handling accounts and authentication.
# We keep this as is.
class User(AbstractUser):
    pass

# NEW: A model to store the different fast-food chains.
class Restaurant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # You could add more fields later, like 'logo_url' or 'website'.
    
    def __str__(self):
        return self.name

# ADAPTED: This replaces the old 'Recipe' model. It's now focused on
# a single menu item belonging to a specific restaurant.
# ADAPTED: This is the new, more detailed version of our MenuItem model.
class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    serving_size = models.CharField(max_length=100, blank=True, null=True)
    
    # Nutritional Information
    calories = models.IntegerField(default=0)
    fat = models.FloatField(default=0)
    sat_fat = models.FloatField(default=0)
    trans_fat = models.FloatField(default=0)
    cholesterol = models.FloatField(default=0)
    sodium = models.FloatField(default=0)
    carbohydrates = models.FloatField(default=0)
    fiber = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    
    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"
    
# ADAPTED: A simplified profile linked to each user.
# We've removed fields like budget, activity, etc., and added a user-set calorie goal.
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    calorie_goal = models.IntegerField(default=2000)
    # Basic info can be added here as needed, e.g., age, weight, etc.
    
    def __str__(self):
        return self.user.username

# KEPT: This model is perfect for tracking daily nutritional intake against goals.
# The logic for updating it will change in views.py, but the model itself is the same.
class MacroTracker(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    
    # Consumed amounts for the day
    calories_consumed = models.IntegerField(default=0)
    protein_consumed = models.FloatField(default=0)
    carbs_consumed = models.FloatField(default=0)
    fats_consumed = models.FloatField(default=0)
    
    def __str__(self):
        return f"Tracker for {self.user.username} on {self.date}"