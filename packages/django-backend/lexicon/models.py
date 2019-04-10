"""
Contains the Django models used to represent lexical items and their features.

It is expected that all interaction with users should take place via the
admin interface and the forms in `.forms`, which perform various
validation/cleaning steps on the data.  If you are modifying the database
directly, you should ensure that the data you are touching remains clean.

- Each LexicalItem has one FeatureSet.
  (e.g., [[iRel], [uT, EPP]])

- Each FeatureSet has one or more Features.
  (e.g., [uT, EPP])

- Each Feature has one or more FeatureProperties.
  (e.g., {name: T}, {interpretable: False}, {EPP: True})
"""
import uuid

from django.db import models
from model_utils import FieldTracker

from notify.models import NotifyModel


class LexicalItem(NotifyModel):
    """
    A Django model representing a single lexical item.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    #: The orthographic representation of this lexical item, to be used when
    #: building up/displaying lexical arrays, etc.
    text = models.CharField(max_length=100)

    #: A short code representing the language that this lexical item belongs
    #: to. By convention, contains a 2 letter ISO language code, optionally
    #: followed by an underscore and a 2 letter ISO country code. Other
    #: values may be used for cases that the convention cannot handle
    #: appropriately.
    #:
    #: In addition, the special code "func" is used for functional items (which
    #: don't belong in any particular language).
    #:
    #: Examples:
    #:   - en
    #:   - en_SG
    #:   - zh
    #:   - func
    language = models.CharField(max_length=50)

    features = models.ManyToManyField("Feature", blank=True)

    #: An optional description of this LexicalItem.
    description = models.TextField(blank=True)

    #: Used for change notifications. Subscribers will only be alerted when a
    #: substantive change is made to a model instance.
    tracker = FieldTracker()

    #: Used for change notifications. Subscribers will receive the latest model
    #: data processed via this serializer.
    serializer_class = "lexicon.serializers.LexicalItemSerializer"

    def features_string(self):
        return ", ".join(
            [str(feature) for feature in sorted(self.features.all(), key=str)]
        )

    def __str__(self):
        return "{} ({}) {}".format(
            self.text, self.language, self.features_string()
        )


class Feature(models.Model):
    """
    A Django model representing a single syntactic feature.
    The same Feature can be in multiple FeatureSets, and FeatureSets consist
    of multiple Features.
    """

    #: A human-friendly short name for this Feature.
    name = models.CharField(max_length=100)

    #: A long description of this Feature.
    description = models.TextField()

    #: A QuerySet representing the FeatureProperties of this Feature.
    properties = models.ManyToManyField("FeatureProperty")

    @property
    def uninterpretable(self):
        """
        Convenience function to hit the database and check whether or not this
        feature is explicitly uninterpretable.
        :return:
        """
        return (
            self.properties.filter(name="interpretable")
            .exclude(raw_value="True")
            .exists()
        )

    def __str__(self):
        # Prefix/suffix will be attached to the Feature's name directly.
        # Members of additional will be displayed as a comma-separated list
        # after the Feature's name.
        prefix = ""
        suffix = ""
        additional = []

        # Prefix: Interpretable/uninterpretable
        interp = self.properties.filter(name="interpretable")
        if len(interp) > 0:
            if interp[0].value:
                prefix = "i"
            else:
                prefix = "u"

        # Additional
        others = self.properties.exclude(name="interpretable")
        for prop in others:
            if prop.type == "Boolean":
                if prop.value:
                    additional.append(prop.name)
                else:
                    additional.append("-{}".format(prop.name))
            else:
                additional.append("{}:{}".format(prop.name, prop.value))

        # Join the main feature name with any additional features
        additional.insert(0, "{}{}{}".format(prefix, self.name, suffix))
        return "[{}]".format(", ".join(additional))


class FeatureProperty(models.Model):
    """
    A Django model representing a primitive property-value pair that may
    form a part of a feature proper.
    Each Feature is a collection of multiple FeatureProperties.
    """

    class Meta:
        verbose_name_plural = "Feature properties"
        unique_together = ("name", "raw_value")

    #: A human-friendly short name for this FeatureProperty.
    name = models.CharField(max_length=100)

    #: A few standard types for the FeatureProperty, for cleaning/validation
    type = models.CharField(
        max_length=10,
        choices=[
            ["Boolean", "Boolean"],
            ["Text", "Text"],
            ["Integer", "Integer"],
        ],
    )

    #: The raw value associated with this FeatureProperty.
    raw_value = models.CharField(max_length=100)

    #: This FeatureProperty's `raw_value` converted according to its `type`
    @property
    def value(self):
        if self.type == "Boolean":
            return self.raw_value == "True"
        if self.type == "Text":
            return str(self.raw_value)
        if self.type == "Integer":
            return int(self.raw_value)

        # Still here?
        return "INVALID_VALUE"

    #: A long description of this FeatureProperty.
    description = models.TextField()

    def __str__(self):
        return "{}: {}".format(self.name, self.value)
