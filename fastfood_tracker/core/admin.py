from django.contrib import admin
from .models import Restaurant, MenuItem, Profile, MacroTracker

# This makes our models visible on the admin page.
admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(Profile)
admin.site.register(MacroTracker)

