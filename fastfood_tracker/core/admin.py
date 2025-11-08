# In core/admin.py
from django.contrib import admin

# --- UPDATED IMPORTS ---
from .models import (
    User, 
    Restaurant, 
    MenuItem, 
    Profile, 
    FavoriteMeal,
    LoggedMeal,     # <-- New
    LoggedMealItem  # <-- New
)

# --- This makes the admin panel much more useful ---
class LoggedMealItemInline(admin.TabularInline):
    """
    Shows the items inside the meal view.
    """
    model = LoggedMealItem
    extra = 0 # Don't show extra empty forms
    readonly_fields = ('menu_item', 'quantity') # Make them read-only in the admin

class LoggedMealAdmin(admin.ModelAdmin):
    """
    Custom admin view for LoggedMeal.
    """
    list_display = ('user', 'name', 'created_at')
    inlines = [LoggedMealItemInline] # Nests the items inside the meal
    list_filter = ('user', 'created_at')
    readonly_fields = ('user', 'name', 'created_at')

# --- Register your models here ---
admin.site.register(User)
admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(Profile)
admin.site.register(FavoriteMeal)

# --- NEW REGISTRATIONS ---
admin.site.register(LoggedMeal, LoggedMealAdmin) # Use the custom admin class

# We don't need to register LoggedMealItem separately 
# because it's now an "inline" in LoggedMealAdmin.