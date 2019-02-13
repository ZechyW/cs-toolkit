#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Override development server address/port
    from django.core.management.commands.runserver import Command as Runserver

    Runserver.default_port = "8080"
    Runserver.default_addr = "0.0.0.0"

    execute_from_command_line(sys.argv)