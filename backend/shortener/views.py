import hashlib

from django.contrib.auth.models import User
from django.core.cache import cache
from django.db import models, transaction
from django.http import HttpRequest, HttpResponseRedirect
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RequestLog, URL
from .serializers import URLWithLogsSerializer, URLSerializer
from .tasks import store_request_log


def get_url_hash(long_url: str) -> str:
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
        hash = get_url_hash(long_url)
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

        cache.set(url.short_url, url.long_url, timeout=3600)

        return Response(URLSerializer(url).data, status=status.HTTP_201_CREATED)

    def get(self, request: HttpRequest):
        user = request.user
        urls = URL.objects.filter(created_by=user)

        return Response(URLSerializer(urls, many=True).data)


class ShortUrlDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: HttpRequest, short_url: str):
        try:
            # find the user
            user_id = None
            user = None
            if request.user.is_authenticated:
                user_id = request.user.id  # type:ignore
                user = User.objects.get(id=user_id)

            url_with_logs = (
                URL.objects.filter(short_url=short_url, created_by=user)
                .prefetch_related(
                    models.Prefetch(
                        "requestlog_set",
                        queryset=RequestLog.objects.order_by("-time")[:20],
                        to_attr="logs",
                    )
                )
                .first()
            )

            if not url_with_logs:
                return Response(
                    {"error": "Short URL not found."}, status=status.HTTP_404_NOT_FOUND
                )
            # Aggregate click count by source
            aggregated_data = (
                RequestLog.objects.filter(short_url=short_url)
                .values("source")
                .annotate(click_count=models.Count("id"))
                .order_by("-click_count")
            )

            # Serialize the URL with logs
            serializer = URLWithLogsSerializer(url_with_logs)

            # Add aggregated data to the response
            data = serializer.data
            data["click_count_by_source"] = list(aggregated_data)  # type:ignore

            return Response(data)
        except URL.DoesNotExist:
            # Handle case when short_url is not found
            return Response(
                {"error": "Short URL not found."}, status=status.HTTP_404_NOT_FOUND
            )


class RedirectShortURLView(APIView):
    def get(self, request, short_url):
        try:
            # Retrieve the long URL from the database
            long_url: str = cache.get(short_url)
            if not long_url:
                url = URL.objects.only("long_url").get(short_url=short_url)
                long_url = url.long_url
                cache.set(short_url, long_url, timeout=3600)

            source = self.get_client_ip(request)
            time = timezone.now()

            # store the redirection record
            store_request_log.delay(short_url, source, time)  # type:ignore

            # Redirect to the long URL
            return HttpResponseRedirect(long_url)
        except URL.DoesNotExist:
            # Handle case when short_url is not found
            return Response(
                {"error": "Short URL not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def get_client_ip(self, request):
        """
        Extract the client's IP address from the request.
        """
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")
