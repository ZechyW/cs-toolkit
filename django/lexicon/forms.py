from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

from .models import Feature


class FeatureForm(forms.ModelForm):
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
        (E.g.: both {interpretable: False} and {interpretable: True} )
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

        # No errors raised?  Return the good data
        return self.cleaned_data
