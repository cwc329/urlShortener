# urlShortener/celery.py
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "urlShortener.settings")

app = Celery("urlShortener")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# Namespace 'CELERY_' means all celery-related config keys
# should start with 'CELERY_' in settings.py.
app.config_from_object("django.conf:settings", namespace="CELERY_")

# Autodiscover tasks in all installed apps.
app.autodiscover_tasks()
