# In fastfood_tracker/urls.py

from django.contrib import admin
from django.urls import path, include
from core.views import IndexView 


urlpatterns = [
    # 1. The Admin Panel: Any URL starting with /admin/ gets sent to Django's built-in admin site.
    path('admin/', admin.site.urls),

    # 2. The API: I decided to prefix all my API endpoints with /api/.
    # This line tells Django to hand off any request for '/api/...' to the
    # url patterns defined in my 'core' app's urls.py file.
    path('api/', include('core.urls')),

    # 3. The Frontend App: This is a catch-all route. If the URL doesn't match
    # '/admin/' or '/api/', it will be handled by the IndexView. The IndexView's
    # only job is to serve the main index.html file of our React application.
    # This is what allows React to take over and handle all the frontend routing.
    path('', IndexView.as_view(), name='index'),
]