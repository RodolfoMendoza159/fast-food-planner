# core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'restaurants', views.RestaurantViewSet, basename='restaurant')

# The API URLs are now determined automatically by the router.
# We still need to manually add the paths for our function-based views.
urlpatterns = [
    path('', include(router.urls)),
    
    # User management endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),

    # Core logic endpoints for the tracker
    path('tracker/', views.get_daily_tracker, name='get-daily-tracker'),
    path('log-meal/', views.log_meal, name='log-meal'),
]