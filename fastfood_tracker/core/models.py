# In core/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    pass

class Restaurant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    serving_size = models.CharField(max_length=100, blank=True, null=True)
    calories = models.FloatField(default=0)
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

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    calorie_goal = models.IntegerField(default=2000)
    def __str__(self):
        return self.user.username

class FavoriteMeal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    items = models.ManyToManyField(MenuItem)

    def __str__(self):
        return f"'{self.name}' by {self.user.username}"
        

# --- (REMOVED) The old MacroTracker model is gone ---


# --- (NEW) Models for New History/Logging ---

class LoggedMeal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="logged_meals")
    name = models.CharField(max_length=100, blank=True, null=True, help_text="Optional name, e.g., 'Lunch'")
    # This automatically captures the exact date and time
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meal for {self.user.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class LoggedMealItem(models.Model):
    # This links a LoggedMeal to a MenuItem AND stores the quantity
    logged_meal = models.ForeignKey(LoggedMeal, on_delete=models.CASCADE, related_name="logged_items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('logged_meal', 'menu_item') # Prevents duplicate items in the *same* meal

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"