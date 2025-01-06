from django.urls import path
from .views import RedirectShortURLView, ShortUrlDetailView, ShortUrlView

urlpatterns = [
    path("api/short-urls/", ShortUrlView.as_view(), name="short-url"),
    path(
        "api/short-urls/<str:short_url>/",
        ShortUrlDetailView.as_view(),
        name="short-url-detail",
    ),
    path(
        "<str:short_url>/",
        RedirectShortURLView.as_view(),
        name="redirect-short-url",
    ),
]
