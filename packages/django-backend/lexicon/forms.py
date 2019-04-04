from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

from .models import LexicalItem, Feature, FeatureProperty


class LexicalItemForm(forms.ModelForm):
    """
    A form for creating/modifying LexicalItems that also performs custom
    uniqueness validation:

    - No two LexicalItems can have the same text, language, and set of
      Features.
    """

    class Meta:
        model = LexicalItem
        fields = ["text", "language", "description", "features"]
        help_texts = {
            "text": _(
                "The orthographic representation of this lexical item, "
                "to be used when building up/displaying lexical arrays, etc."
            ),
            "language": _(
                "A short code representing the language that this lexical "
                "item belongs to.<br>"
                "By convention, contains a 2 letter ISO language code, "
                "optionally followed by an underscore and a 2 letter ISO "
                "country code. Other values may be used for cases that the "
                "convention cannot handle appropriately.<br>"
                "In addition, the special code `func` is used for functional "
                "items (which don't belong in any particular language)."
            ),
            "description": _(
                "An optional description providing more information about "
                "this lexical item."
            ),
        }

    def clean(self):
        """
        Checks that no two LexicalItems have the same text, language,
        and set of Features.
        :return:
        """
        super().clean()

        text = self.cleaned_data.get("text")
        language = self.cleaned_data.get("language")
        features = self.cleaned_data.get("features")

        # Get other LexicalItems with the same text and language.
        other_items = LexicalItem.objects.filter(text__exact=text).filter(
            language__exact=language
        )

        # If this is an update to an existing LexicalItem, exclude it
        if self.instance.pk is not None:
            other_items = other_items.exclude(pk=self.instance.pk)

        other_items = other_items.prefetch_related("features")
        for item in other_items:
            if set(item.features.all()) == set(features):
                raise ValidationError(
                    _(
                        "There is already a LexicalItem in the database with "
                        "that text, language, and set of Features: %(string)s"
                    ),
                    code="duplicate_feature",
                    params={"string": item},
                )

        # No errors raised?  Return the good data
        return self.cleaned_data


class FeatureForm(forms.ModelForm):
    """
    A form for creating/modifying Features that also performs custom
    uniqueness validation:

    - A Feature cannot have multiple FeatureProperties with the same name
      (E.g., both {interpretable: False} and {interpretable: True})
    - No two Features can have the same name and FeatureProperties set.
    """

    class Meta:
        model = Feature
        fields = ["name", "description", "properties"]
        help_texts = {
            "name": _(
                "A short, memorable identifier for this Feature that will be "
                "used to generate its display name."
            )
        }

    def clean(self):
        """
        Checks that the Feature does not have multiple FeatureProperties
        with the same name.
        (E.g.: both {interpretable: False} and {interpretable: True})

        Also checks that no features share the same name and
        FeatureProperties set.
        """
        super().clean()

        feature_props = self.cleaned_data.get("properties")

        # Return early if no properties were specified at all (we will let
        # the default validation catch and reject the empty field if necessary)
        if not feature_props:
            return self.cleaned_data

        # Check property names
        all_names = []
        duplicate_names = []
        for prop in feature_props:
            if prop.name in all_names:
                # We've seen this type of property before.
                if prop.name not in duplicate_names:
                    duplicate_names.append(prop.name)
            else:
                all_names.append(prop.name)

        # Raise ValidationErrors for any duplicates
        if len(duplicate_names) > 0:
            raise ValidationError(
                [
                    ValidationError(
                        _(
                            "Multiple values were selected for the "
                            "FeatureProperty: %(name)s"
                        ),
                        code="duplicate_property",
                        params={"name": name},
                    )
                    for name in duplicate_names
                ]
            )

        ########################################################
        # Check for other Features with the same name and set of
        # FeatureProperties
        other_features = Feature.objects.filter(
            name__exact=self.cleaned_data.get("name")
        )

        # If this is an update to an existing Feature, exclude it
        if self.instance.pk is not None:
            other_features = other_features.exclude(pk=self.instance.pk)

        other_features = other_features.prefetch_related("properties")
        for feature in other_features:
            if set(feature.properties.all()) == set(feature_props):
                # Same name, same properties
                raise ValidationError(
                    _(
                        "There is already a Feature in the database with that "
                        "name and set of FeatureProperties: %(string)s"
                    ),
                    code="duplicate_feature",
                    params={"string": feature},
                )

        # No errors raised?  Return the good data
        return self.cleaned_data


class FeaturePropertyForm(forms.ModelForm):
    """
    A form for creating/modifying FeatureProperties that also performs custom
    validation:

    - If a FeatureProperty has a `type` of "Boolean", its `raw_value` should be
    either "True" or "False".
    - If it has a `type` of "Integer", its `raw_value` will be a string that
    can be parsed into an integer.
    - If it has a `type` of "Text", its `raw_value` will be any
    user-specified string.
    """

    class Meta:
        model = FeatureProperty
        fields = ["name", "description", "type", "raw_value"]
        labels = {"raw_value": _("Value")}

    # All the custom validation takes place in the attached .js file,
    # which also modifies the form elements on the fly.
    class Media:
        js = ["lexicon/FeaturePropertyType.js"]
