#!/usr/bin/env python
"""
This is Django's command-line utility for administrative tasks.
I don't write the code in this file myself; it was automatically generated
when I initialized the Django project. Its only job is to let me run
management commands.
"""
import os
import sys


def main():
    """Run administrative tasks."""
    # This is the most important line. It tells Django which settings file to use
    # for the project ('fastfood_tracker.settings').
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastfood_tracker.settings')
    try:
        # This part tries to import the main Django command execution function.
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # If Django can't be imported, it raises an error with a helpful message.
        # This usually happens if I forget to activate the virtual environment (`venv`).
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # This line takes the arguments from the command line (like 'runserver')
    # and passes them to Django to be executed.
    execute_from_command_line(sys.argv)


# This is a standard Python entry point. If this script is run directly,
# it calls the main() function.
if __name__ == '__main__':
    main()

# This file should generally not be modified. It's a core part of the
# Django framework's tooling that I rely on to manage the application.