from django.conf import settings
from rest_framework import serializers
from urllib.parse import urlparse
from .models import RequestLog, URL


class URLSerializer(serializers.ModelSerializer):
    full_short_url = serializers.SerializerMethodField()

    class Meta:
        model = URL
        fields = ["id", "long_url", "short_url", "full_short_url"]
        read_only_fields = ["short_url", "full_short_url"]

    def get_full_short_url(self, obj):
        # Add the location prefix before the short URL
        location_prefix = settings.APP_SHORT_URL_PREFIX
        return f"{location_prefix}{obj.short_url}"

    def validate_long_url(self, value):
        """
        Custom validation for the long_url field to ensure it's a valid URL.
        """
        parsed_url = urlparse(value)
        if not parsed_url.scheme or not parsed_url.netloc:
            raise serializers.ValidationError("Enter a valid URL.")
        if parsed_url.scheme not in ["http", "https"]:
            raise serializers.ValidationError("Only HTTP and HTTPS URLs are allowed.")

        return value


class RequestLogSerializer(serializers.ModelSerializer):
    short_url = serializers.CharField(source="short_url.short_url", read_only=True)
    long_url = serializers.CharField(source="short_url.long_url", read_only=True)

    class Meta:
        model = RequestLog
        fields = [
            "id",
            "long_url",
            "short_url",
            "source",
            "time",
        ]
        read_only_fields = [
            "id",
            "long_url",
            "short_url",
            "source",
            "time",
        ]


class URLWithLogsSerializer(serializers.ModelSerializer):
    logs = RequestLogSerializer(many=True)

    class Meta:
        model = URL
        fields = ["short_url", "long_url", "logs"]
