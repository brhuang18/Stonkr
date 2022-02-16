import json
from rest_framework import status
from django.test import TestCase, Client
from django.urls import reverse
from account.models import Account
from account.serializers import RegistrationSerializer


# initialize the APIClient app
#client = Client()

class TestLoginView(TestCase):
    """Test the functionality of the Login view"""

    def setUp(self):
        self.client = Client()
        Account.objects.create(username="testinguser",email="testing@email.com",password="testingpassword",
        first_name="somename",last_name="another_name")

    def test_basic_login_username(self):
            """Test basic login username"""
            # response = self.client.post('/admin/register/', {
            #     'username': 'testinguser',
            #     'email' : 'testing@email.com',
            #     'password': 'testingpassword',
            #     'first_name' : 'somename',
            #     'last_name' : 'another_name',
            # })

            # self.assertEquals(response.status_code, 302)
            #self.assertEquals(response.url, reverse('users:send_email_verification'))
            #self.assertEquals(Account.objects.get(username='testinguser').email, 'testing@email.com')
            #print(Account.objects.all())
            print(Account.objects.all())
            response = self.client.post('/admin/login/', {
                'username': 'testinguser',
                'password': 'testingpassword'
            })

            self.assertEquals(response.status_code, 200)
            #self.assertIsNone(response.context)