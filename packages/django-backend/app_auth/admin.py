from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import AppUser

# Register custom User model with the admin site.
admin.site.register(AppUser, UserAdmin)
