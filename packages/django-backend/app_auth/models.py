from django.contrib.auth.models import AbstractUser


class AppUser(AbstractUser):
    """
    Custom User model in case we need more complex authentication behaviour
    in the future.
    """

    pass
