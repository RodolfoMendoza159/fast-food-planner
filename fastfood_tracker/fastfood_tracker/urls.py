# In fastfood_tracker/fastfood_tracker/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This line correctly includes all the URLs from your 'core' app,
    # making your API endpoints (like /api/login/, /api/restaurants/, etc.) available.
    path('api/', include('core.urls')),
]