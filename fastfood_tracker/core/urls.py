# In core/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
# --- UPDATED ROUTER ---
# This registers all your ViewSets
router.register(r'restaurants', views.RestaurantViewSet, basename='restaurant')
router.register(r'favorites', views.FavoriteMealViewSet, basename='favoritemeal')
# --- NEW: This adds the /api/items/ endpoint for search ---
router.register(r'items', views.MenuItemViewSet, basename='menuitem') 

urlpatterns = [
    # This includes all the ViewSet URLs (e.g., /api/restaurants/, /api/items/)
    path('', include(router.urls)),
    
    # --- Auth URLs (No Change) ---
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    
    # --- Profile URL (No Change) ---
    path('profile/', views.manage_user_profile, name='profile'),
    
    # --- UPDATED: Pointing to the new tracker/history views ---
    path('tracker/', views.get_daily_tracker, name='tracker'),
    path('log_meal/', views.log_meal, name='log_meal'),
    path('history/', views.get_meal_history, name='history'),
]