from django.db.models import query
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from watchlist.serializers import WatchlistCreateSerializer, WatchlistUpdateSerializer, WatchlistViewSerializer, WatchlistDataCreateSerializer
from stock.models import Stock
from watchlist.models import Watchlist, Watchlist_Data
from user.models import Followed_Watchlist_Data
from account.models import Account

import re
import json
import requests
from bs4 import BeautifulSoup

API_KEY = "HRHSV3RY4TUAZ7QH"

@api_view(['POST',])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def create_view(request):
    data = request.data.copy()
    watchlist_name = data.get('watchlist_name')
    user_id = data.get('user')
    privacy = data.get('privacy')

    if isinstance(privacy, str):
        privacy = json.loads(privacy.lower())
    
    try:
        user = Account.objects.get(pk = user_id)
        if user.privacy and not privacy:
            return Response({'response': "Your profile is private. You can't have a public watchlist."}, status = status.HTTP_400_BAD_REQUEST)
        if user.pk != request.user.pk:
            return Response({'response': "Your can't create a watchlist for another user."}, status = status.HTTP_400_BAD_REQUEST)
    except:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST) 
    
    #if name already exists for that user, return error
    try:
        temp = Watchlist.objects.get(watchlist_name = watchlist_name, user = user_id)
        return Response({'response': "Enter a unique watchlist name."}, status=status.HTTP_400_BAD_REQUEST)
    except:
        pass
    #else, make table with watchlist_name
    serializer =  WatchlistCreateSerializer(data=data)
    data = {}
    if serializer.is_valid():
        watchlist = serializer.save()
        data['watchlist_id'] = watchlist.pk
        data['user_id'] = watchlist.user_id
        data['watchlist_name'] = watchlist.watchlist_name
        data['privacy'] = watchlist.privacy
        return Response(data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT',])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def edit_view(request):
    data = request.data.copy()
    watchlist_id = data.get('watchlist_id')
    watchlist_name = data.get('watchlist_name')
    user_id = data.get('user')
    privacy = data.get('privacy')

    if isinstance(privacy, str):
        privacy = json.loads(privacy.lower())
        
    try:
        user = Account.objects.get(pk = user_id)
        if user.privacy and not privacy:
            return Response({'response': "Your profile is private. You can't have a public watchlist."}, status = status.HTTP_400_BAD_REQUEST)
    except:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST)     
        
    #CHECK FOR VALID WATCHLIST ID
    try:
        watchlist = Watchlist.objects.get(pk = watchlist_id) 
    #if the watchlist does not exist
    except Watchlist.DoesNotExist:
        return Response({'response': "Enter a valid watchlist id."}, status=status.HTTP_400_BAD_REQUEST)
    #CHECK IF OWNER OF WATCHLIST IS CORRECT
    #if the user trying to edit is not the owner of the watchlist
    if watchlist.user.pk != int(data.get('user')):
        return Response({'response': "You don't have permission to edit this watchlist!"}, status=status.HTTP_403_FORBIDDEN)

    #CHECK FOR A CHANGE IN WATCHLIST OR PRIVACY
    update = False
    if watchlist_name is not None:
        try:
            #check if there exists watchlist with name for the user
            temp = Watchlist.objects.get(watchlist_name = watchlist_name, user = user_id)
            #if the current watchlist's name is not changing but the privacy is, update
            if temp == watchlist:
                if privacy is not None and temp.privacy != privacy:
                    #update if the privacy is different
                    update = True          
        except: 
            #update if there is not a watchlist with the same name
            update = True
    else:
        if privacy is not None:
            curr = Watchlist.objects.get(pk = watchlist_id)
            if curr.privacy != privacy:
                update = True
 
    if update == False:
        return Response({'response':'Please enter a unique watchlist name or change of privacy setting.'}, status=status.HTTP_400_BAD_REQUEST)

    #else, update table
    serializer =  WatchlistUpdateSerializer(watchlist, data=data, partial = True)
    data = {}
    if serializer.is_valid():
        serializer.save()
        data['response'] = 'UPDATE SUCCESS'
        data['watchlist_id'] = watchlist.pk
        data['user_id'] = watchlist.user_id
        data['watchlist_name'] = watchlist.watchlist_name
        data['privacy'] = watchlist.privacy
        return Response(data, status=status.HTTP_200_OK)
        
    else:
        return Response({'response': "Invalid fields."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', ])
@permission_classes((IsAuthenticated,))
def delete_view(request):
    data = request.data.copy()
    watchlist_id = data.get('watchlist_id')
    try:
        watchlist = Watchlist.objects.get(pk = watchlist_id) 
    #if the watchlist does not exist
    except Watchlist.DoesNotExist:
        return Response({'response': "Enter a valid watchlist id."}, status=status.HTTP_400_BAD_REQUEST)
    #check if user owns that watchlist
    if watchlist.user.pk != int(data.get('user')):
        return Response({'response': "You do not have permission to delete that watchlist!"}, status=status.HTTP_403_FORBIDDEN)
    operation = watchlist.delete()
    data = {}
    if operation:
        data["success"] = "Watchlist deletion successful"
        return Response(data=data)
    else:
        data["failure"] = "Watchlist deletion failed"
        return Response(data=data, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def get_view(request):
    user = request.GET.get('user')
    watchlist_id = request.GET.get('watchlist_id')
    try:
        watchlist = Watchlist.objects.get(pk = watchlist_id) 
    #if the watchlist does not exist
    except Watchlist.DoesNotExist:
        return Response({'response': "Enter a valid watchlist id."}, status=status.HTTP_400_BAD_REQUEST)
    #if the user trying to edit is not the owner of the watchlist
    if watchlist.privacy and watchlist.user.pk != int(user):
        return Response({'response': "You don't have permission to retrieve this watchlist!"}, status=status.HTTP_403_FORBIDDEN)
    
    following = Followed_Watchlist_Data.objects.filter(watchlist = watchlist_id)
    
    watchlist_data = Watchlist_Data.objects.filter(watchlist = watchlist_id)
    
    stocks = []
    for w_d in watchlist_data:
        stocks.append(w_d.stock.pk)
    
    data = {}
    data['watchlist_id'] = watchlist.pk
    data['user_id'] = watchlist.user_id
    data['username'] = watchlist.user.username
    data['watchlist_name'] = watchlist.watchlist_name
    data['privacy'] = watchlist.privacy
    data['num_following'] = len(following)
    data['stocks'] = stocks
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def get_all_view(request):
    user = request.GET.get('user')
    try:
        ret = []
        #get all watchlists from the user
        queryset = Watchlist.objects.filter(user = user)
        if (len(queryset) == 0):
            data = {}
            data['watchlists'] = ret
            data['num_following'] = 0
            data['stocks'] = []
            return Response(data = data, status=status.HTTP_200_OK)
        is_user = queryset[0].user.pk == int(request.user.pk)
        #serialize the watchlists
        try:
            watchlistSet = [WatchlistViewSerializer(w).data for w in queryset]
        except:
            return Response({'response': 'Could not serialize watchlists'}, status=status.HTTP_400_BAD_REQUEST)

        num_following = 0
        stocks = []
        
        for w in watchlistSet:
            if is_user or not w.get('privacy'):
                #create list of serialized watchlists
                ret.append(w)
                try:
                    following = Followed_Watchlist_Data.objects.filter(watchlist = w.get('id'))
                except:
                    return Response({'response': 'Could not filter followed watchlists from the watchlist id'}, status=status.HTTP_400_BAD_REQUEST)

                num_following += len(following)
                
                try:
                    watchlist_data = Watchlist_Data.objects.filter(watchlist = w.get('id'))
                except:
                    return Response({'response': 'Could not filter watchlists from the watchlist id'}, status=status.HTTP_400_BAD_REQUEST)

        
                for w_d in watchlist_data:
                    if w_d.stock.pk not in stocks:
                        stocks.append(w_d.stock.pk)
                        
        data = {}
        data['watchlists'] = ret
        data['num_following'] = num_following
        data['stocks'] = stocks

        return Response(data = data, status=status.HTTP_200_OK)
    except:
        return Response({'response': 'Could not retrieve user\'s watchlists'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST',])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def add_stock_view(request):
    data = request.data.copy()
    user_id = data.get('user')
    stock_id = data.get('stock')
    watchlist_id = data.get('watchlist')
    try:
        watchlist = Watchlist.objects.get(pk = watchlist_id) 
    #if the watchlist does not exist
    except Watchlist.DoesNotExist:
        return Response({'response': "Enter a valid watchlist id."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        stock = Stock.objects.get(pk = stock_id)
    #if the stock does not exist
    except Stock.DoesNotExist:
        return Response({'response': "Enter a valid stock id."}, status=status.HTTP_400_BAD_REQUEST)
    
    #check stock doesn't already exist in the user's watchlist
    watchlist_stock = Watchlist_Data.objects.filter(stock = stock_id, watchlist = watchlist)
    if watchlist_stock:
        return Response({'response': "Enter a stock id that isn't in the watchlist."}, status=status.HTTP_400_BAD_REQUEST)

    #check that the user adding stocks is the watchlist's owner
    if watchlist.user.pk != int(user_id):
        return Response({'response': "You don't have permission to add stocks to this watchlist!"}, status=status.HTTP_403_FORBIDDEN)

    serializer =  WatchlistDataCreateSerializer(data=data)
    data = {}
    if serializer.is_valid():
        watchlist_data = serializer.save()
        data['watchlist_data_id'] = watchlist_data.pk
        data['watchlist_id'] = watchlist_data.watchlist_id
        data['stock_id'] = watchlist_data.stock_id
        return Response(data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', ])
@permission_classes((IsAuthenticated,))
def remove_stock_view(request):
    data = request.data.copy()
    user_id = data.get('user')
    watchlist_id = data.get('watchlist')
    stock_ticker = data.get('stock_ticker')
    try:
        watchlist_data = Watchlist_Data.objects.get(watchlist = watchlist_id, stock = stock_ticker)
        watchlist = Watchlist.objects.get(pk = watchlist_data.watchlist_id) 
    #if the watchlist does not exist
    except Watchlist_Data.DoesNotExist:
        return Response({'response': "Enter a valid watchlist,stock_ticker pair."}, status=status.HTTP_400_BAD_REQUEST)

    #check that the user removing stocks is the watchlist's owner
    if watchlist.user.pk != int(user_id):
        return Response({'response': "You don't have permission to remove stocks from this watchlist!"}, status=status.HTTP_403_FORBIDDEN)

    operation = watchlist_data.delete()
    data = {}
    if operation:
        data["success"] = "Stock removal successful"
        return Response(data=data, status = status.HTTP_200_OK)
    else:
        data["failure"] = "Stock removal failed"
        return Response(data=data, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def metrics_view(request):
    user_id = request.user.pk
    watchlist_id = request.GET.get('watchlist_id')

    try:
        watchlist = Watchlist.objects.get(pk = watchlist_id) 
    #if the watchlist does not exist
    except Watchlist.DoesNotExist:
        return Response({'response': "Enter a valid watchlist id."}, status=status.HTTP_400_BAD_REQUEST)
    #check that the user adding stocks is the watchlist's owner
    if watchlist.privacy and watchlist.user.pk != int(user_id):
        return Response({'response': "You don't have permission to view metrics for this watchlist!"}, status=status.HTTP_403_FORBIDDEN)

    data = []
    #get all watchlist_data for the watchlist
    watchlist_data = Watchlist_Data.objects.filter(watchlist = watchlist_id)
    #iterate through data
    url = "https://finance.yahoo.com/quote/{}?p={}"
    headers = { 
        'User-Agent'      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36', 
        'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 
        'Accept-Language' : 'en-US,en;q=0.5',
        'DNT'             : '1', # Do Not Track Request Header 
        'Connection'      : 'close'
    }

    for i in range(len(watchlist_data)):
        temp = {}

        stock_ticker = watchlist_data[i].stock_id
        
        #querying the website
        response = requests.get(url.format(stock_ticker, stock_ticker), headers = headers)
        #response data in html format
        soup = BeautifulSoup(response.text,'html.parser')
        
        pattern = re.compile(r'\s--\sData\s--\s')
        script_data = soup.find('script', text=pattern).contents[0]
        start = script_data.find('context')-2
        context = json.loads(script_data[start:-12])

        price = context['context']['dispatcher']['stores']['QuoteSummaryStore']['price']
        quote_summary = context['context']['dispatcher']['stores']['QuoteSummaryStore']['summaryDetail']

        temp['stock_ticker'] = stock_ticker
        temp['stock_name'] = soup.find('h1',{'class':'D(ib) Fz(18px)'}).text[:-(3+len(stock_ticker))]
        temp['close'] = price['regularMarketPrice']['fmt'].replace(',','')
        temp['change'] = price['regularMarketChange']['fmt'].replace(',','')
        temp['percent_change'] = price['regularMarketChangePercent']['fmt']
        temp['bid'] = quote_summary['bid']['fmt'] + ' x ' + quote_summary['bidSize']['longFmt']
        temp['ask'] = quote_summary['ask']['fmt'] + ' x ' + quote_summary['askSize']['longFmt']
        temp['open'] = price['regularMarketOpen']['fmt'].replace(',','')
        temp['high'] = quote_summary['regularMarketDayHigh']['fmt'].replace(',','')
        temp['low'] = quote_summary['regularMarketDayLow']['fmt'].replace(',','')
        temp['volume'] = price['regularMarketVolume']['raw']

        data.append(temp)

    return Response({'metrics':data})
    
@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def movements_view(request):
    data = {}

    user_id = request.GET.get('user')
    watchlists = Watchlist.objects.filter(user = user_id)
    
    is_user = int(request.user.pk) == int(user_id)
    
    watchlist_data_all = []
    for w in watchlists:
        if is_user or not w.privacy:
            watchlist_data = Watchlist_Data.objects.filter(watchlist = w.pk)
            for wd in watchlist_data:
                watchlist_data_all.append(wd)

    stock_data = []
    url = "https://finance.yahoo.com/quote/{}?p={}"
    headers = { 
        'User-Agent'      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36', 
        'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 
        'Accept-Language' : 'en-US,en;q=0.5',
        'DNT'             : '1', # Do Not Track Request Header 
        'Connection'      : 'close'
    }
    for i in range(len(watchlist_data_all)):
        temp = {}

        stock_ticker = watchlist_data_all[i].stock_id
        #querying the website
        response = requests.get(url.format(stock_ticker, stock_ticker), headers = headers)
        #response data in html format
        soup = BeautifulSoup(response.text,'html.parser')
        
        pattern = re.compile(r'\s--\sData\s--\s')
        script_data = soup.find('script', text=pattern).contents[0]
        start = script_data.find('context')-2
        context = json.loads(script_data[start:-12])

        price = context['context']['dispatcher']['stores']['QuoteSummaryStore']['price']

        temp['stock_ticker'] = stock_ticker
        temp['stock_name'] = soup.find('h1',{'class':'D(ib) Fz(18px)'}).text[:-(3+len(stock_ticker))]
        temp['close'] = price['regularMarketPrice']['fmt'].replace(',','')
        temp['change'] = price['regularMarketChange']['fmt'].replace(',','')
        temp['percent_change'] = price['regularMarketChangePercent']['fmt'].strip('%')

        if temp not in stock_data:
            stock_data.append(temp)

    stock_data = sorted(stock_data, key=lambda d: float(d['percent_change']), reverse = True)
    for d in stock_data:
        d['percent_change'] = f"{d['percent_change']}%"
    data['top_movements'] = stock_data[:5]
    stock_data.reverse()
    data['bottom_movements'] = stock_data[:5]

    return Response({'movements':data})