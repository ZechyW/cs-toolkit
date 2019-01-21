"""
Project-specific classes
"""
import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import models
from django.utils.module_loading import import_string


class NotifyModel(models.Model):
    """
    An abstract base model that emits notifications on the `notify` channel layer group
    when changed.
    """

    # Added here for reference, but this will need to be replaced by an actual
    # model_utils.FieldTracker on derived classes for change notifications to work
    tracker = None

    # Similarly, this will need to be defined for each derived class
    serializer_class = None

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Some instance of the model class is being saved to the database.
        :param args:
        :param kwargs:
        :return:
        """
        ret = super().save(*args, **kwargs)
        self.notify_changes()
        return ret

    def delete(self, *args, **kwargs):
        """
        Some instance of the model class is being deleted from the database.
        :param args:
        :param kwargs:
        :return:
        """
        self.notify_delete()
        return super().delete(*args, **kwargs)

    def notify_changes(self):
        """
        Send the change notification on the `notify` channel layer group, warning
        about subclassing without instantiating a model_utils.FieldTracker
        :return:
        """
        if self.tracker is None or self.serializer_class is None:
            print(
                "-----\n"
                "To use the change notification functionality of {}, add an instance "
                "of model_utils.FieldTracker to the model as a class variable named "
                '"tracker" and a serializer class string as "serializer_class".\n'
                "-----".format(self.__class__.__name__)
            )
            return

        has_changed = self.tracker.changed()
        if len(has_changed.keys()) == 0:
            return

        # This model object has changed; serialize it and let people know
        serializer = import_string(self.serializer_class)(self)
        data = serializer.data
        channel_layer = get_channel_layer()
        print(
            "-----\n"
            "Model object created/updated: {}\n"
            "{}\n"
            "-----".format(
                self.__class__.__name__, json.dumps(data)
            )
        )
        async_to_sync(channel_layer.group_send)(
            "notify",
            {
                "type": "notify.change",
                "model": self.__class__.__name__,
                "data": json.dumps(data),
            },
        )

    def notify_delete(self):
        """
        Send the deletion notification on the `notify` channel layer group
        :return:
        """
        if self.tracker is None or self.serializer_class is None:
            print(
                "-----\n"
                "To use the change notification functionality of {}, add an instance "
                "of model_utils.FieldTracker to the model as a class variable named "
                '"tracker" and a serializer class string as "serializer_class".\n'
                "-----".format(self.__class__.__name__)
            )
            return

        serializer = import_string(self.serializer_class)(self)
        data = serializer.data
        channel_layer = get_channel_layer()
        print(
            "-----\n"
            "Model object deleted: {}\n"
            "{}\n"
            "-----".format(
                self.__class__.__name__, json.dumps(data)
            )
        )
        async_to_sync(channel_layer.group_send)(
            "notify",
            {
                "type": "notify.delete",
                "model": self.__class__.__name__,
                "data": json.dumps(data),
            },
        )
