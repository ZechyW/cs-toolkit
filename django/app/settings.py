"""
Django settings for app project.

Generated by 'django-admin startproject' using Django 2.1.5.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "ll(_n((i#1q@k!3#1@g)tebwh25*4nicwj7lm63aq181*7@b(j"

if os.environ.get("DJANGO_DEBUG"):
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = True
else:
    DEBUG = False
    ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    # Whitenoise
    "whitenoise.runserver_nostatic",
    # Django
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Django admin site
    "bootstrap_admin",
    "app.admin.AppAdminConfig",
    "django.contrib.admindocs",
    # 3rd-party libraries: Django REST Framework and Channels for API/Async
    # operations
    "rest_framework",
    "channels",
    # App to manage the frontend sources
    "frontend",
    # For auto-notifying clients of changes
    "notify",
    # Models
    "lexicon",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "app.middleware.WhiteNoisePathMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "app.urls"

# Custom frontend templates are stored within the root `react` folder.
# Custom backend templates are stored within the `templates` folder.
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(BASE_DIR, "../react/django-templates"),
            os.path.join(BASE_DIR, "templates"),
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "app.wsgi.application"

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation"
        ".UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {
        "NAME": "django.contrib.auth.password_validation"
        ".CommonPasswordValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation"
        ".NumericPasswordValidator"
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"level": "INFO", "class": "logging.StreamHandler"}
    },
    "loggers": {
        # We might not want super-verbose logging on the server when developing
        "django.channels.server": {"level": "WARNING"},
        "cs-toolkit": {"handlers": ["console"], "level": "INFO"},
    },
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = "/static/"

# Frontend bundles and other static files are saved/built into the `react`
# folder, and they are served directly from there if `DEBUG` or
# `WHITENOISE_USE_FINDERS` is True
STATICFILES_DIRS = [("frontend", "../react/built"), "../static"]

# Whitenoise
# To serve compressed static files, `DEBUG` or `WHITENOISE_USE_FINDERS` must be
# False, and the static files must be available in `STATIC_ROOT` (i.e.,
# by running `collectstatic`)
STATIC_ROOT = "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Channels
ASGI_APPLICATION = "app.routing.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [("127.0.0.1", 6379)]},
    }
}

# DRF
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_PARSER_CLASSES": ("rest_framework.parsers.JSONParser",),
}
