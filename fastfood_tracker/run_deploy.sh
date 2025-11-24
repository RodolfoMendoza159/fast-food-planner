#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run database migrations
echo "Applying database migrations..."
python manage.py migrate

# Load initial restaurant data
# Note: This command should be idempotent (safe to run multiple times).
# If it's not, you may need to run this manually one time.
echo "Loading menu data..."
python manage.py load_menu_data

# Start the Gunicorn web server
echo "Starting Gunicorn server..."
gunicorn fastfood_tracker.wsgi:application --bind 0.0.0.0:$PORT