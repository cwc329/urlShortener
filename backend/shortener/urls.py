from django.urls import path
from .views import RedirectShortURLView, ShortUrlView

urlpatterns = [
    path("", ShortUrlView.as_view(), name="short-url"),
    path(
        "<str:short_url>/",
        RedirectShortURLView.as_view(),
        name="redirect-short-url",
    ),
]
