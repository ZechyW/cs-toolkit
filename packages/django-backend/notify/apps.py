from django.apps import AppConfig


class NotifyConfig(AppConfig):
    name = "notify"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import notify.signals
