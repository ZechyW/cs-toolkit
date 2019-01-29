"""
Sets up the customised Admin site for the project.
"""
from collections import defaultdict

from django.apps import apps
from django.contrib import admin
from django.contrib.admin.apps import AdminConfig
from django.http import Http404
from django.template.response import TemplateResponse
from django.utils.translation import gettext as _


#: Custom ordering for project models based on their names
model_order = defaultdict(int)
model_order.update(
    {
        # Lexicon models
        "Lexical items": 1,
        "Feature sets": 2,
        "Features": 3,
        "Feature properties": 4,
    }
)


class AppAdminSite(admin.AdminSite):
    """
    A customised AdminSite that sorts apps and models according to a
    specified order, rather than alphabetically.
    """

    def get_app_list(self, request):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site, with custom ordering.
        """
        app_list = super().get_app_list(request)

        # Sort the models according to the custom ordering.
        for app in app_list:
            app["models"].sort(key=lambda m: model_order[m["name"]])

        return app_list

    def app_index(self, request, app_label, extra_context=None):
        """
        Overwrites the default AdminSite behaviour to use custom ordering
        with the models for individual apps as well.
        :param request:
        :param app_label:
        :param extra_context:
        :return:
        """
        app_dict = self._build_app_dict(request, app_label)
        if not app_dict:
            raise Http404("The requested admin page does not exist.")
        # Sort the models alphabetically within each app.
        app_dict["models"].sort(key=lambda m: model_order[m["name"]])
        app_name = apps.get_app_config(app_label).verbose_name
        context = {
            **self.each_context(request),
            "title": _("%(app)s administration") % {"app": app_name},
            "app_list": [app_dict],
            "app_label": app_label,
            **(extra_context or {}),
        }

        request.current_app = self.name

        return TemplateResponse(
            request,
            self.app_index_template
            or ["admin/%s/app_index.html" % app_label, "admin/app_index.html"],
            context,
        )


class AppAdminConfig(AdminConfig):
    default_site = "app.admin.AppAdminSite"
