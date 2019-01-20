"""
Topic handlers for frontend Pub/Sub connections.

Handler class names correspond to the topics they each listen to, after the topic string
has been run through the normalisation in `consumers.get_handler_name`.

Handler classes will be initialised the first time a Consumer receives a message with
its topic, and should define a `handle` method that takes the message as an argument.

The Handler's `disconnect` method will also be called when the Consumer's connection
is closed.
"""
from .echo import *
