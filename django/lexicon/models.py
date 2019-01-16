from django.db import models


# Create your models here.
class LexicalItem(models.Model):
    orthographic_representation = models.CharField(max_length=100)
    language_code = models.CharField(max_length=2)
