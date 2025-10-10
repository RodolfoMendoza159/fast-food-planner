from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# The standard Django's User model for handling accounts and authentication.
# R: Decided to keep Django's build-in one and extend it. 
class User(AbstractUser):
    pass

# R: A model to stores the different fast-food restaurant chains. Crucial for
# data structure, names gathered from CSV import script.
class Restaurant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # R: (FUTURE PLAN) We could add more fields later, like 'logo_url' or 'website'.
    # to make the frontend more appealing.
    def __str__(self):
        return self.name

# R: A model to store individual menu items from each restaurant.
# Each item is linked to a Restaurant via a ForeignKey relationship.
class MenuItem(models.Model):
    # R: This ForeignKey basically links that if a restaurant is deleted, then all
    # its menu items get deleted too. 
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    serving_size = models.CharField(max_length=100, blank=True, null=True)
    
    # Nutritional Information 
    # R: I updated them to be very detailed to fulfill the goal of
    # probading full nutritional data for each item.
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
    
# A simple profile linked to each user via a OnetoOneField.
# R: This was a key part of the important upgrade to Django for storing user-specific data.
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    calorie_goal = models.IntegerField(default=2000)
    # R: (FUTURE PLAN) We can easily add more user-specific info here later,
    # like age, weight, or dietary preferences, to give personalized feedback.
    def __str__(self):
        return self.user.username

# This model tracks a user's daily nutritional intake.
# A new entry is created for each user for each day they log a meal.
class MacroTracker(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    
    # These fields will be updated every time a user logs a meal.    
    calories_consumed = models.IntegerField(default=0)
    protein_consumed = models.FloatField(default=0)
    carbs_consumed = models.FloatField(default=0)
    fat_consumed = models.FloatField(default=0)
    
    def __str__(self):
        return f"Tracker for {self.user.username} on {self.date}"