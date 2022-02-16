from django.shortcuts import render
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
from account.models import Account
from trade.models import Trade
from portfolio.models import Portfolio
from stock.models import Stock
from rest_framework.authtoken.models import Token
from trade.serializers import TradeCreateSerializer, TradeUpdateSerializer, TradeViewSerializer

# Create your views here.
@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def create_trade_view(request):

    if request.method == 'POST':
        data = request.data.copy()
        print(data)
        portfolio = Portfolio.objects.get(pk = request.data['portfolio'])
        if portfolio.user != request.user:
            return Response({'response': "You don't have permission to add trades to this portfolio!"}, status = status.HTTP_403_FORBIDDEN)
        
        serializer = TradeCreateSerializer(data = data)
        #print(data)
        check_sell = "S"
        if (data['order_type'][0].casefold() == check_sell.casefold()):
            queryset1 = Trade.objects.filter(portfolio = data['portfolio'], stock = data['stock'], order_type__istartswith="b")
            buy_quantity = 0
            for query in queryset1:
                buy_quantity += query.quantity
            
            queryset2 = Trade.objects.filter(portfolio = data['portfolio'], stock = data['stock'], order_type__istartswith="s")
            sell_quantity = int(data['quantity'])
            for query in queryset2:
                sell_quantity += query.quantity

            if (sell_quantity > buy_quantity):
                return Response({"response": "Invalid Trade. Your the total of your sell orders exceeds the total of your buy orders"}, status = status.HTTP_400_BAD_REQUEST)
        
        data = {}
        if serializer.is_valid():
            trade = serializer.save()
            data['trade_id'] = trade.pk
            data['portfolio_id'] = trade.portfolio_id
            data['stock_id'] = trade.stock_id
            data['trade_date'] = trade.trade_date
            data['order_price'] = trade.order_price
            data['brokerage_fee'] = trade.brokerage_fee
            data['order_type'] = trade.order_type
            data['quantity'] = trade.quantity
            data['quantity_left'] = trade.quantity_left

            #print("can return")
            #print(data)
            return Response(data = data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE', ])
@permission_classes((IsAuthenticated,))
def delete_trade_view(request):
    try:
        trade = Trade.objects.get(pk = request.data['trade_id'])
    except Trade.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    #print(trade.portfolio.user)
    if trade.portfolio.user != user:
        return Response({'response': "You don't have permission to delete this trade!"}, status = status.HTTP_403_FORBIDDEN)
        
    if request.method == "DELETE":
        operation = trade.delete()
        data = {}
        if operation:
            data["success"] = "delete successful"
            return Response(data=data)
        else:
            data["failure"] = "delete failed"
            return Response(data=data, status = status.HTTP_400_BAD_REQUEST)

@api_view(['PUT',])
@permission_classes((IsAuthenticated,))
def update_trade_view(request):
    data = request.data.copy()

    try:
        trade = Trade.objects.get(pk = request.data['trade_id'])
    except Trade.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if trade.portfolio.user != user:
        return Response({'response': "You don't have permission to edit this trade!"}, status = status.HTTP_403_FORBIDDEN)
    
    if "portfolio" in request.data:
        try:
            request_portfolio = Portfolio.objects.filter(user_id=user).get(portfolio_name=request.data['portfolio'])
        except Portfolio.DoesNotExist:
            return Response({'response': "You don't have a portfolio with this name"}, status = status.HTTP_404_NOT_FOUND)
        data['portfolio'] = request_portfolio.id
        
    """
    Cases to check for:
    1) if portfolio is given in request
    2) if stock is given in request
    3) if order type is given in request
    4) if quantity is given in request
    """
    check_sell = "S"
    if ("order_type" in request.data):
        check_order_type = data['order_type']
    else:
        check_order_type = trade.order_type

    if (check_order_type[0].casefold() == check_sell.casefold()):
        if ("portfolio" in request.data):
            check_portfolio = data['portfolio']
        else:
            check_portfolio = trade.portfolio_id

        if ("stock" in request.data):
            check_stock = data['stock']
        else:
            check_stock = trade.stock
        
        if ("quantity" in request.data):
            check_quantity = data['quantity']
        else:
            check_quantity = trade.quantity

        queryset1 = Trade.objects.filter(portfolio = check_portfolio, stock = check_stock, order_type__istartswith="b")
        buy_quantity = 0
        for query in queryset1:
            if (query.id == trade.id):
                continue
            buy_quantity += query.quantity
        
        queryset2 = Trade.objects.filter(portfolio = check_portfolio, stock = check_stock, order_type__istartswith="s")
        sell_quantity = int(check_quantity)
        for query in queryset2:
            if (query.id == trade.id):
                continue
            sell_quantity += query.quantity

        if (sell_quantity > buy_quantity):
            return Response({"response": "Invalid Trade. Your the total of your sell orders exceeds the total of your buy orders"}, status = status.HTTP_400_BAD_REQUEST)
        

    if request.method == 'PUT':
        serializer = TradeUpdateSerializer(trade, data=data, partial=True)
        data = {}
        if serializer.is_valid():
            serializer.save()
            data['response'] = 'UPDATE SUCCESS'
            data['trade_id'] = trade.pk
            data['portfolio_id'] = trade.portfolio_id
            data['stock_id'] = trade.stock_id
            data['trade_date'] = trade.trade_date
            data['order_price'] = trade.order_price
            data['brokerage_fee'] = trade.brokerage_fee
            data['order_type'] = trade.order_type
            data['quantity'] = trade.quantity
            data['quantity_left'] = trade.quantity_left
            return Response(data=data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def trade_stock_view(request):
    try:
        portfolio = Portfolio.objects.get(pk = request.GET.get('portfolio_id'))
    except Portfolio.DoesNotExist:
        return Response({'response': 'Portfolio does not exist!'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        stock = Stock.objects.get(pk = request.GET.get('stock_ticker'))
    except Stock.DoesNotExist:
        return Response({'response': 'Stock does not exist!'}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    if (portfolio.user != user and portfolio.privacy):
        return Response({'response': "You don't have permission to view this portfolio holding!"}, status = status.HTTP_403_FORBIDDEN)

    try:
        ret = []
        queryset = Trade.objects.filter(stock=stock.pk, portfolio = portfolio.pk).order_by('trade_date')
        tradeSet = [TradeViewSerializer(t).data for t in queryset]
        
        for trade in tradeSet:
            trade['portfolio_name'] = portfolio.portfolio_name
            ret.append(trade)

        return Response({'trades': ret})
    except:
        return Response({'response': 'Bad Request'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', ])
@permission_classes((IsAuthenticated,))
def trade_portfolio_view(request):
    try:
        portfolio = Portfolio.objects.get(pk = request.GET.get('portfolio_id'))
    except Portfolio.DoesNotExist:
        return Response({'response': 'Portfolio does not exist!'}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    if (portfolio.user != user and portfolio.privacy):
        return Response({'response': "You don't have permission to view this portfolio holding!"}, status = status.HTTP_403_FORBIDDEN)

    try:
        ret = []
        queryset = Trade.objects.filter(portfolio = portfolio.pk).order_by('trade_date')
        tradeSet = [TradeViewSerializer(t).data for t in queryset]
        
        for trade in tradeSet:
            ret.append(trade)

        return Response({'trades': ret})
    except:
        return Response({'response': 'Bad Request'}, status=status.HTTP_400_BAD_REQUEST)