from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView, ListAPIView
from django.contrib.auth import authenticate, logout
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from account.serializers import RegistrationSerializer, AccountUpdateSerializer, AccountPasswordUpdateSerializer
from account.models import Account
from rest_framework.authtoken.models import Token
from account.validators import valid_email, valid_username
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.conf import settings


# Create your views here.
@api_view(['POST', ])
@permission_classes([])
@authentication_classes([])
def registration_view(request):
    data = {}
    email = request.data.get('email', '0').lower()
    if valid_email(email) != None:
        data['error_message'] = 'Email is already in use!'
        data['response'] = 'ERROR'
        return Response(data, status=status.HTTP_403_FORBIDDEN)

    username = request.data.get('username', '0')
    if valid_username(username) != None:
        data['error_message'] = 'That username is already in use!'
        data['response'] = 'ERROR'
        return Response(data, status=status.HTTP_403_FORBIDDEN)

    serializer = RegistrationSerializer(data=request.data)
    if serializer.is_valid():
        account = serializer.save()
        data['response'] = 'Registration successful!'
    else:
        print("have an error")
        print(serializer.errors)
        data['response'] = 'ERROR'
        data['error_message'] = 'Invalid details'
        return Response(data, status=status.HTTP_401_UNAUTHORIZED)

    password = request.data.get('password', '0')
    account = authenticate(username=username, password=password)
    if account:
        try:
            token = Token.objects.get(user=account)
        except Token.DoesNotExist:
            token = Token.objects.create(user=account)
        data['user_id'] = account.pk
        data['token'] = token.key
    else:
        data['response'] = 'ERROR'
        data['error_message'] = 'Invalid username/email or password'
        return Response(data, status=status.HTTP_401_UNAUTHORIZED)
    return Response(data)

# LOGIN
class LoginView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        res = {}
        username = request.data.get('username')
        password = request.data.get('password')
        account = authenticate(username=username, password=password)
        if account:
            try:
                token = Token.objects.get(user=account)
            except Token.DoesNotExist:
                token = Token.objects.create(user=account)
            res['response'] = 'Successful login!'
            res['user_id'] = account.pk
            res['token'] = token.key
        else:
            res['response'] = 'ERROR'
            res['error_message'] = 'Invalid username/email or password'
            return Response(res, status=status.HTTP_401_UNAUTHORIZED)

        return Response(res)

# LOGOUT
@api_view(["POST"])
@permission_classes((IsAuthenticated,))
def logout_view(request):
    request.user.auth_token.delete()
    logout(request)
    return Response('Successfully Logged Out!')

#RESET PASSWORD
@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    :param sender: View Class that sent the signal
    :param instance: View Instance that sent the signal
    :param reset_password_token: Token Model Object
    :param args:
    :param kwargs:
    :return:
    """
    # send an e-mail to the user
    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'email': reset_password_token.user.email,
        # 'reset_password_url': "{}?token={}".format(
        #     instance.request.build_absolute_uri(reverse('password_reset:reset-password-confirm')),
        #     reset_password_token.key)
        'reset_password_url' : "http://localhost:3000/resetpassword/{}".format(reset_password_token.key)
    }
    print(context)
    # render email text
    email_html_message = render_to_string('user_reset_password.html', context)
    email_plaintext_message = render_to_string('user_reset_password.txt', context)
    print(email_html_message)
    print(email_plaintext_message)
    msg = EmailMultiAlternatives(
        # title:
        "Password Reset for {title}".format(title="Stonkr Backend"),
        # message:
        email_plaintext_message,
        # from:
        settings.EMAIL_HOST_USER,
        # to:
        [reset_password_token.user.email]
    )
    msg.attach_alternative(email_html_message, "text/html")
    msg.send()