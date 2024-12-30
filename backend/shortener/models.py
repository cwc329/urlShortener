from django.contrib.auth.models import User
from django.db import models

# Create your models here.


class URL(models.Model):
    long_url = models.TextField()
    short_url = models.CharField(max_length=12, unique=True, db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.short_url


class RequestLog(models.Model):
    short_url = models.ForeignKey(
        URL, on_delete=models.CASCADE, to_field="short_url", db_column="short_url"
    )
    source = models.CharField(max_length=45)
    time = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Redirect to {self.short_url.short_url} at {self.time}"
