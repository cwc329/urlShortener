import hashlib
import logging
from datetime import timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.http import HttpRequest, HttpResponseRedirect
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import URL, RequestLog
from .serializers import RequestLogSerializer, URLSerializer

logger = logging.getLogger(__name__)


def get_short_url(long_url: str) -> str:
    return hashlib.md5(long_url.encode()).hexdigest()


class ShortUrlView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request: HttpRequest):
        # parse body
        serializer = URLSerializer(data=request.data)  # type:ignore

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        long_url = serializer.validated_data["long_url"]  # type:ignore
        hash = get_short_url(long_url)
        hashStart = 0
        hashEnd = 6

        # find the user
        user_id = None
        user = None
        if request.user.is_authenticated:
            user_id = request.user.id  # type:ignore
            user = User.objects.get(id=user_id)

        # save url pair
        url = URL(short_url=hash[hashStart:hashEnd], long_url=long_url, created_by=user)
        created = URL.objects.filter(short_url=url.short_url)
        while created:
            hashStart += 1
            hashEnd += 1
            url.short_url = hash[hashStart:hashEnd]
            created = URL.objects.filter(short_url=url.short_url)

        url.save()

        return Response(URLSerializer(url).data, status=status.HTTP_201_CREATED)

    def get(self, request: HttpRequest):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        user = request.user
        logs = RequestLog.objects.select_related("short_url").filter(
            short_url__created_by=user,
            time__gte=thirty_days_ago,
        )

        return Response(RequestLogSerializer(logs, many=True).data)


class RedirectShortURLView(APIView):
    def get(self, request, short_url):
        try:
            # Retrieve the long URL from the database
            # TODO: use cache
            url = URL.objects.get(short_url=short_url)
            source = request.META.get("REMOTE_ADDR")
            time = timezone.now()

            # Log and store the redirection
            logger.info(
                f"Redirecting short_url: {short_url} to long_url: {url.long_url} at {time} from IP: {source}"
            )
            # TODO: use celery to avoid blocking responses because of db operation
            RequestLog.objects.create(
                short_url=url,
                time=time,
                source=source,
            )

            # Redirect to the long URL
            return HttpResponseRedirect(url.long_url)
        except URL.DoesNotExist:
            # Handle case when short_url is not found
            return Response(
                {"error": "Short URL not found."}, status=status.HTTP_404_NOT_FOUND
            )
