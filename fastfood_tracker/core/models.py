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

# --- UPDATED MODEL ---
class MacroTracker(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    
    # R: This is the key change. We now store a list of all items eaten
    # during the day directly on the tracker itself.
    items = models.ManyToManyField(MenuItem)
    
    calories_consumed = models.IntegerField(default=0)
    protein_consumed = models.FloatField(default=0)
    fat_consumed = models.FloatField(default=0)
    carbs_consumed = models.FloatField(default=0)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"Tracker for {self.user.username} on {self.date}"