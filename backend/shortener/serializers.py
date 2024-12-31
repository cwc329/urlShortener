from rest_framework import serializers
from .models import RequestLog, URL
from urllib.parse import urlparse


class URLSerializer(serializers.ModelSerializer):
    class Meta:
        model = URL
        fields = ["id", "long_url", "short_url"]
        read_only_fields = ["short_url"]

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
