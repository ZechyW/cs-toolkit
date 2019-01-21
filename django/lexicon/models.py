from django.db import models
from model_utils import FieldTracker

from app.models import NotifyModel


# Create your models here.
class LexicalItem(NotifyModel):
    text = models.CharField(max_length=100)
    language_code = models.CharField(max_length=50)

    # For notification tracking
    tracker = FieldTracker()
    serializer_class = "lexicon.serializers.LexicalItemSerializer"

    def __str__(self):
        return self.text
