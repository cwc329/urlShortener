from time import sleep
from celery import shared_task
from .models import RequestLog, URL


@shared_task
def store_request_log(short_url, source, time):
    RequestLog.objects.create(
        short_url_id=short_url,
        source=source,
        time=time,
    )
