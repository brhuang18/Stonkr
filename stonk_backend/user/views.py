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
from account.serializers import RegistrationSerializer, AccountUpdateSerializer, AccountPasswordUpdateSerializer, AccountProfileSerializer
from account.models import Account
from rest_framework.authtoken.models import Token
from account.validators import valid_email, valid_username
from django.contrib.auth.hashers import check_password

from watchlist.models import Watchlist
from portfolio.models import Portfolio
from account.models import Account
from user.models import Followed_Portfolio_Data, Followed_Watchlist_Data
from user.serializers import FollowedWatchlistDataCreateSerializer, FollowedPortfolioDataCreateSerializer
from portfolio.helpers import get_portfolio_overview
# Create your views here.

# EDIT INFO
@api_view(["PUT"])
@permission_classes((IsAuthenticated,))
def profile_update_view(request):
    data = {}
    try:
        account = Account.objects.get(id=request.data['user_id'])
    except Account.DoesNotExist:
        data['error_message'] = 'Account does not exist!'
        data['response'] = 'ERROR'
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    if (request.user.id != int(request.data['user_id'])):
        data['error_message'] = 'You do not have permission to edit that!'
        data['response'] = 'ERROR'
        print(account.id)
        print(request.data['user_id'])
        return Response(data, status=status.HTTP_403_FORBIDDEN)
    
    if ('email' in request.data):
        email = request.data.get('email', '0').lower()
        if valid_email(email) != None:
            data['error_message'] = 'Email is already in use!'
            data['response'] = 'ERROR'
            return Response(data, status=status.HTTP_403_FORBIDDEN)
    if ('username' in request.data):
        username = request.data.get('username', '0')
        if valid_username(username) != None:
            data['error_message'] = 'That username is already in use!'
            data['response'] = 'ERROR'
            return Response(data, status=status.HTTP_403_FORBIDDEN)
    
    serializer = AccountUpdateSerializer(account, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        data['response'] = 'Update success!'
        data['data'] = serializer.data
        return Response(data=data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT',])
@permission_classes((IsAuthenticated, ))
def update_password_view(request):
    data = {}
    try:
        account = Account.objects.get(id=request.data['user_id'])
    except Account.DoesNotExist:
        data['error_message'] = 'Account does not exist!'
        data['response'] = 'ERROR'
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    if (request.user.id != int(request.data['user_id'])):
        data['error_message'] = 'You do not have permission to edit that!'
        data['response'] = 'ERROR'
        return Response(data, status=status.HTTP_403_FORBIDDEN)
    
    if (check_password(request.data['original_password'], request.user.password)):
        print("PASSWORD MATCHES")
    else:
        data['error_message'] = "Password Validation Error"
        data['response'] = 'ERROR'
        return Response(data, status = status.HTTP_400_BAD_REQUEST)
    
    if (str(request.data['new_password']) != str(request.data['confirm_new_password'])):
        data['error_message'] = 'Passwords are not matching!'
        data['response'] = 'ERROR'
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    try:
        account.set_password(request.data['new_password'])
        account.save()
        data['response'] = 'Successfully changed password!'
        return Response(data=data)
    except:
        data['error_message'] = 'Could not change password!'
        data['response'] = 'ERROR'
        return Response(data=data, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def account_profile_view(request):
    user_id = request.GET.get('user_id')
    try:
        account = Account.objects.get(id=user_id)
    except:
        print(user_id)
        return Response({'response': 'Account does not exist!'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AccountProfileSerializer(account)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def follow_watchlist_view(request):
    user_id = request.data.get('user')
    watchlist_id = request.data.get('watchlist')

    try:
        user = Account.objects.get(pk = user_id)
    #if the user does not exist
    except Account.DoesNotExist:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        watchlist = Watchlist.objects.get(pk = watchlist_id) 
    #if the watchlist does not exist
    except Watchlist.DoesNotExist:
        return Response({'response': "Enter a valid watchlist id."}, status=status.HTTP_400_BAD_REQUEST)
    
    followed_watchlist = Followed_Watchlist_Data.objects.filter(user = user, watchlist = watchlist)
    if followed_watchlist:
        return Response({'response': "Enter a watchlist id that isn't followed."}, status=status.HTTP_400_BAD_REQUEST)

    if watchlist.privacy:
        return Response({'response': "Watchlist is private."}, status=status.HTTP_403_FORBIDDEN)

    if watchlist.user == user:
        return Response({'response': "You can't follow your own watchlists."}, status=status.HTTP_403_FORBIDDEN)

    serializer = FollowedWatchlistDataCreateSerializer(data=request.data)
    data = {}
    if serializer.is_valid():
        followed_watchlist_data = serializer.save()
        data['followed_watchlist_data_id'] = followed_watchlist_data.pk
        data['user_id'] = followed_watchlist_data.user_id
        data['watchlist_id'] = followed_watchlist_data.watchlist_id
        return Response(data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', ])
@permission_classes((IsAuthenticated,))
def unfollow_watchlist_view(request):
    data = request.data.copy()
    user_id = data.get('user')
    watchlist_id = data.get('watchlist')
    try:
        followed_watchlist_data = Followed_Watchlist_Data.objects.get(user = user_id, watchlist = watchlist_id)
    #if the followed watchlist does not exist
    except Followed_Watchlist_Data.DoesNotExist:
        return Response({'response': "Enter a valid user/watchlist pair."}, status=status.HTTP_400_BAD_REQUEST)

    #check that the user unfollowing the watchlist is the original user
    if followed_watchlist_data.user.pk != int(user_id):
        return Response({'response': "You don't have permission to unfollow this watchlist!"}, status=status.HTTP_403_FORBIDDEN)

    operation = followed_watchlist_data.delete()
    data = {}
    if operation:
        data["success"] = "Watchlist of interest removed."
        return Response(data=data, status = status.HTTP_200_OK)
    else:
        data["failure"] = "Watchlist of interest removal failed."
        return Response(data=data, status = status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def follow_portfolio_view(request):
    user_id = request.data.get('user')
    portfolio_id = request.data.get('portfolio')

    try:
        user = Account.objects.get(pk = user_id)
    #if the user does not exist
    except Account.DoesNotExist:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        portfolio = Portfolio.objects.get(pk = portfolio_id) 
    #if the portfolio does not exist
    except Portfolio.DoesNotExist:
        return Response({'response': "Enter a valid portfolio id."}, status=status.HTTP_400_BAD_REQUEST)
    
    followed_portfolio = Followed_Portfolio_Data.objects.filter(user = user, portfolio = portfolio)
    if followed_portfolio:
        return Response({'response': "Enter a portfolio id that isn't followed."}, status=status.HTTP_400_BAD_REQUEST)

    if portfolio.privacy:
        return Response({'response': "Portfolio is private."}, status=status.HTTP_403_FORBIDDEN)

    if portfolio.user == user:
        return Response({'response': "You can't follow your own portfolios."}, status=status.HTTP_403_FORBIDDEN)

    serializer = FollowedPortfolioDataCreateSerializer(data=request.data)
    data = {}
    if serializer.is_valid():
        followed_portfolio_data = serializer.save()
        data['followed_portfolio_data_id'] = followed_portfolio_data.pk
        data['user_id'] = followed_portfolio_data.user_id
        data['portfolio_id'] = followed_portfolio_data.portfolio_id
        return Response(data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', ])
@permission_classes((IsAuthenticated,))
def unfollow_portfolio_view(request):
    data = request.data.copy()
    user_id = data.get('user')
    portfolio_id = data.get('portfolio')
    try:
        followed_portfolio_data = Followed_Portfolio_Data.objects.get(user = user_id, portfolio = portfolio_id)
    #if the followed portfolio does not exist
    except Followed_Portfolio_Data.DoesNotExist:
        return Response({'response': "Enter a valid user/portfolio pair."}, status=status.HTTP_400_BAD_REQUEST)

    #check that the user unfollowing the portfolio is the original user
    if followed_portfolio_data.user.pk != int(user_id):
        return Response({'response': "You don't have permission to unfollow this portfolio!"}, status=status.HTTP_403_FORBIDDEN)

    operation = followed_portfolio_data.delete()
    data = {}
    if operation:
        data["success"] = "Portfolio of interest removed."
        return Response(data=data, status = status.HTTP_200_OK)
    else:
        data["failure"] = "Portfolio of interest removal failed."
        return Response(data=data, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET', ])
@permission_classes([])
def get_followed_view(request):
    user_id = request.GET.get('user')

    try:
        user = Account.objects.get(pk = user_id)
    #if the user does not exist
    except Account.DoesNotExist:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST)

    data = {}
    data['user'] = user_id

    followed_watchlists = Followed_Watchlist_Data.objects.filter(user = user_id)
    followed_watchlists = [FollowedWatchlistDataCreateSerializer(w).data for w in followed_watchlists]
    
    watchlists = []
    for fw in followed_watchlists:
        watchlist_data = {}
        w = Watchlist.objects.get(pk = fw.get('watchlist'))
        u = Account.objects.get(pk = w.user.pk)
        watchlist_data['watchlist_id'] = w.pk
        watchlist_data['user_id'] = w.user.pk
        watchlist_data['username'] = u.username
        watchlist_data['watchlist_name'] = w.watchlist_name
        watchlist_data['privacy'] = w.privacy
        watchlists.append(watchlist_data)
    data['watchlists'] = watchlists
    
    followed_portfolios = Followed_Portfolio_Data.objects.filter(user = user_id)
    followed_portfolios = [FollowedPortfolioDataCreateSerializer(p).data for p in followed_portfolios]
    
    portfolios = []
    for fp in followed_portfolios:
        p = Portfolio.objects.get(pk = fp.get('portfolio'))
        u = Account.objects.get(pk = p.user.pk)
        portfolio_data = get_portfolio_overview(p)
        portfolio_data.pop('num_following')
        portfolio_data['username'] = u.username
        portfolio_data['privacy'] = p.privacy
        portfolios.append(portfolio_data)
    data['portfolios'] = portfolios        
    

    return Response(data = data, status = status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def is_following_portfolio_view(request):
    portfolio_id = request.GET.get('portfolio_id')

    followed_portfolios = Followed_Portfolio_Data.objects.filter(user=request.user.id)
    followed_portfolio_ids = [x.portfolio.id for x in followed_portfolios]

    data = {'is_following': int(portfolio_id) in followed_portfolio_ids}

    return Response(data, status = status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def is_following_watchlist_view(request):
    watchlist_id = request.GET.get('watchlist_id')

    followed_watchlists = Followed_Watchlist_Data.objects.filter(user=request.user.id)
    followed_watchlist_ids = [x.watchlist.id for x in followed_watchlists]

    data = {'is_following': int(watchlist_id) in followed_watchlist_ids}

    return Response(data, status = status.HTTP_200_OK)