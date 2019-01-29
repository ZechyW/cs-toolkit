"""
Contains the Django models used to represent lexical items and their features.

- Each LexicalItem has one FeatureSet.
  (e.g., [[iRel], [uT, EPP]])

- Each FeatureSet has one or more Features.
  (e.g., [uT, EPP])

- Each Feature has one or more SubFeatures.
  (e.g., {name: T}, {interpretable: False}, {EPP: True})
"""

from django.db import models
from model_utils import FieldTracker

from app.models import NotifyModel


# Create your models here.
class LexicalItem(NotifyModel):
    text = models.CharField(max_length=100)
    language_code = models.CharField(max_length=50)

    #: Used for change notifications. Subscribers will only be alerted when a
    #: substantive change is made to a model instance.
    tracker = FieldTracker()

    #: Used for change notifications. Subscribers will receive the latest model
    #: data processed via this serializer.
    serializer_class = "lexicon.serializers.LexicalItemSerializer"

    def __str__(self):
        return self.text
