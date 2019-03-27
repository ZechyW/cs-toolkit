from django import forms
from django.utils.translation import ugettext_lazy as _


class RuleDescriptionForm(forms.ModelForm):
    class Meta:
        fields = ["name", "description"]
        help_texts = {
            "name": _(
                "A unique identifier for this Rule.<br>"
                "Will also be used to generate the name of the Python class "
                "that corresponds to this Rule on the backend server "
                "(displayed below)."
            ),
            "rule_class": _(
                "The name of the Python class that corresponds to this Rule "
                "on the backend server."
            ),
        }


class GeneratorDescriptionForm(forms.ModelForm):
    class Meta:
        fields = ["name", "description"]
        help_texts = {
            "name": _(
                "A unique identifier for this Generator.<br>"
                "Will also be used to generate the name of the Python class "
                "that corresponds to this Generator on the backend server "
                "(displayed below)."
            ),
            "rule_class": _(
                "The name of the Python class that corresponds to this "
                "Generator on the backend server."
            ),
        }
