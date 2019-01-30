"""
Models related to automatic model change tracking/notifications.
"""
import json
import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import models
from django.utils.module_loading import import_string

logger = logging.getLogger("cs-toolkit")


class NotifyModel(models.Model):
    """
    An abstract base model that emits notifications on the `notify` channel
    layer group when changed.
    """

    # Added here for reference, but this will need to be replaced by an actual
    # model_utils.FieldTracker on derived classes for change notifications
    # to work
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
        if self.has_non_m2m_changed():
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

    def subclass_valid(self):
        """
        Logs a warning and returns False if subclasses don't properly define
        `tracker` or `serializer_class`
        :return:
        """
        if self.tracker is None or self.serializer_class is None:
            logger.warning(
                "-----\n"
                "To use the change notification functionality of {}, add an "
                "instance of model_utils.FieldTracker to the model as a "
                "class variable named `tracker` and a serializer class "
                "string as `serializer_class`".format(self.__class__.__name__)
            )
            return False

        # Still here?
        return True

    def has_non_m2m_changed(self):
        """
        Checks the model's FieldTracker to see if any of the non-m2m fields
        have changed. Changes to m2m fields will be caught by the
        `m2m_changed` signal in `notify.signals` instead, because we can
        only get their changes *after* the `save()` method returns.

        See: https://stackoverflow.com/questions/23795811/django-accessing
        -manytomany-fields-from-post-save-signal

        :return:
        """
        if not self.subclass_valid():
            return False

        has_changed = self.tracker.changed()
        return len(has_changed.keys()) > 0

    def notify_changes(self):
        """
        Send the change notification on the `notify` channel layer group,
        warning
        about subclassing without instantiating a model_utils.FieldTracker
        :return:
        """
        if not self.subclass_valid():
            return False

        # This model object has changed; serialize it and let people know
        serializer = import_string(self.serializer_class)(self)
        data = serializer.data
        channel_layer = get_channel_layer()
        logger.info(
            "-----\n"
            "Model object created/updated: {}\n"
            "{}".format(self.__class__.__name__, json.dumps(data))
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
        if not self.subclass_valid():
            return False

        serializer = import_string(self.serializer_class)(self)
        data = serializer.data
        channel_layer = get_channel_layer()
        logger.info(
            "-----\n"
            "Model object deleted: {}\n"
            "{}".format(self.__class__.__name__, json.dumps(data))
        )
        async_to_sync(channel_layer.group_send)(
            "notify",
            {
                "type": "notify.delete",
                "model": self.__class__.__name__,
                "data": json.dumps(data),
            },
        )
