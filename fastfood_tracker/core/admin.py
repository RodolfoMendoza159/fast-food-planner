from django.contrib import admin
from .models import User, Restaurant, MenuItem, Profile, MacroTracker

# This is where I register each of my models to make them accessible
# in the Django admin dashboard. It's a simple way to get a powerful
# data management interface for free.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(MacroTracker)

# R: (FUTURE PLAN) If I need more control over how models are displayed in the admin
# (e.g., adding search bars, filters, or customizing the list view),
# I'll create custom ModelAdmin classes here and register them instead.