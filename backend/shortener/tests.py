from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from .models import URL, RequestLog

# Create your tests here.


class ShortURLCreationTest(TestCase):
    test_username = "dev_test"
    test_password = "dev_test"

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username=cls.test_username, password=cls.test_password)

    def test_create_short_url(self):
        user = User.objects.get(username=self.test_username)
        self.client.login(username=self.test_username, password=self.test_password)
        response = self.client.post(
            reverse("short-url"), {"long_url": "https://example.com"}
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(URL.objects.filter(long_url="https://example.com").exists())
        url = URL.objects.filter(long_url="https://example.com").first()
        self.assertEqual(url.created_by, user)

    def test_invalid_url(self):
        self.client.login(username=self.test_username, password=self.test_password)
        response = self.client.post(reverse("short-url"), {"long_url": "invalid-url"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Enter a valid URL.", response.json().get("long_url", []))

    # TODO: add tests for GET /shortUrl/
    # def test_get_short_urls(self):


class RedirectShortURLTest(TestCase):
    def setUp(self):
        self.short_url = URL.objects.create(
            long_url="https://example.com", short_url="abc123"
        )

    def test_redirect_short_url(self):
        response = self.client.get(
            reverse("redirect-short-url", args=[self.short_url.short_url])
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "https://example.com")

    def test_redirect_logging(self):
        self.client.get(reverse("redirect-short-url", args=[self.short_url.short_url]))
        self.assertTrue(RequestLog.objects.filter(short_url=self.short_url).exists())


class RequestLoggingTest(TestCase):
    def setUp(self):
        self.short_url = URL.objects.create(
            long_url="https://example.com", short_url="abc123"
        )

    def test_log_contains_client_info(self):
        self.client.get(
            reverse("redirect-short-url", args=[self.short_url.short_url]),
            REMOTE_ADDR="127.0.0.1",
        )
        log_entry = RequestLog.objects.filter(short_url=self.short_url).first()

        self.assertIsNotNone(log_entry)
        self.assertEqual(log_entry.source, "127.0.0.1")


class EdgeCaseTest(TestCase):
    test_username = "dev_test"
    test_password = "dev_test"

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username=cls.test_username, password=cls.test_password)

    def test_missing_long_url(self):
        self.client.login(username=self.test_username, password=self.test_password)
        response = self.client.post(reverse("short-url"), {})
        self.assertEqual(response.status_code, 400)
        self.assertIn("This field is required.", response.json().get("long_url", []))

    def test_nonexistent_short_url(self):
        response = self.client.get(reverse("redirect-short-url", args=["nonexistent"]))
        self.assertEqual(response.status_code, 404)
