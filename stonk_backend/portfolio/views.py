import csv 
import io
import requests

from account.models import Account
from portfolio.models import Portfolio
from trade.models import Trade 
from user.models import Followed_Portfolio_Data
from trade.serializers import TradeCreateSerializer
from stock.models import Stock
from portfolio.serializers import PortfolioSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from portfolio.permissions import IsOwner
from rest_framework.authentication import TokenAuthentication
from rest_framework import generics
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.parsers import MultiPartParser 

from dateutil.parser import parse as parse_date
from collections import defaultdict

from portfolio.helpers import position_info, get_holdings, get_portfolio_overview, get_time_series, get_users_owning_stock, get_holding_value_change

API_KEY = "HRHSV3RY4TUAZ7QH"

def get_portfolio(portfolio_id):
    """
    Return the Portfolio object corresponding to the portfolio_id
    """
    try:
        portfolio = Portfolio.objects.get(id=portfolio_id)
        return portfolio
    except Portfolio.DoesNotExist:
        raise Http404

class PortfolioDetail(generics.GenericAPIView):
    """
    Create, edit, delete portfolios
    """

    permission_classes = (IsAuthenticated, IsOwner,) 
    authentication_classes = (TokenAuthentication,) 

    def get_portfolio(self, portfolio_id):
        portfolio = get_portfolio(portfolio_id)
        self.check_object_permissions(self.request, portfolio)
        return portfolio

    def get_duplicates(self, user, portfolio_name):
        user_portfolios = Portfolio.objects.filter(user_id=user)
        return user_portfolios.filter(portfolio_name=portfolio_name)

    def post(self, request):
        # Check if there are any other portfolios with this name
        portfolio_name = request.data.get('portfolio_name')
        if self.get_duplicates(request.user, portfolio_name).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer = PortfolioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        portfolio_id = request.GET.get('portfolio_id')
        portfolio = self.get_portfolio(portfolio_id)
        serializer = PortfolioSerializer(portfolio)
        data = serializer.data
        data['user_id'] = portfolio.user_id
        tmp_user = Account.objects.filter(pk = portfolio.user_id)
        data['username'] = tmp_user[0].username
        return Response(data, status=status.HTTP_200_OK)


    def put(self, request):
        portfolio_id = request.data.get('portfolio_id')
        portfolio_name = request.data.get('portfolio_name')
        privacy = request.data.get('privacy')

        duplicates = self.get_duplicates(request.user, portfolio_name)
        if portfolio_name and duplicates.exclude(id=portfolio_id).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        portfolio = self.get_portfolio(portfolio_id)
        if portfolio_name:
            portfolio.portfolio_name = portfolio_name
        if privacy is not None:
            portfolio.privacy = privacy

        portfolio.save()

        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def delete(self, request):
        portfolio_id = request.data.get('portfolio_id')
        portfolio = self.get_portfolio(portfolio_id)
        portfolio.delete()

        return Response(status=status.HTTP_200_OK)


def position_info(trades):
    """
    Get the total gains from all sell trades, and the cost basis and units of the remaining position 
    """
    trades = trades.order_by('trade_date')

    gains = 0

    buy_queue = []
    for trade in trades:
        if trade.order_type == 'B':
            buy_queue.append(trade)
        elif trade.order_type == 'S':
            cost_basis = 0

            q = trade.quantity 
            while q > 0:
                first_buy = buy_queue[0]
                if first_buy.quantity > q:
                    cost_basis += (first_buy.order_price + first_buy.brokerage_fee / first_buy.quantity) * q

                    # Adjust the buy order
                    first_buy.brokerage_fee *= (1 - q/first_buy.quantity)
                    first_buy.quantity -= q

                    q = 0
                else:
                    q -= first_buy.quantity
                    cost_basis += first_buy.quantity * first_buy.order_price + first_buy.brokerage_fee
                    buy_queue.pop(0)
            
            gains += trade.order_price * trade.quantity - cost_basis - trade.brokerage_fee

    remaining_cost = 0
    remaining_units = 0
    for buy in buy_queue:
        remaining_cost += buy.order_price * buy.quantity + buy.brokerage_fee
        remaining_units += buy.quantity

    return {
        'gains_from_sale': float(gains),
        'cost': float(remaining_cost),
        'units': float(remaining_units)
    }


@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_holdings_view(request):
    portfolio_id = request.GET.get('portfolio_id')
    portfolio = get_portfolio(portfolio_id)

    if portfolio.privacy and portfolio.user_id != request.user.id:
        return Response(status=status.HTTP_403_FORBIDDEN)

    trades = Trade.objects.filter(portfolio_id=portfolio_id)

    data = get_holdings(trades)

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_portfolio_overview_view(request):
    portfolio_id = request.GET.get('portfolio_id')
    portfolio = get_portfolio(portfolio_id)

    if portfolio.user_id == request.user.id or not portfolio.privacy:
        return Response(get_portfolio_overview(portfolio), status=status.HTTP_200_OK)

    return Response(status=status.HTTP_403_FORBIDDEN)
    

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_portfolios_overview_view(request):
    user_id = request.GET.get('user_id')

    if user_id and user_id != request.user.id:
        user_portfolios = Portfolio.objects.filter(user=user_id).filter(privacy=False)
    else:
        user_portfolios = Portfolio.objects.filter(user=request.user.id)

    portfolio_overviews = []
    combined_portfolio_value = 0
    for portfolio in user_portfolios:
        overview = get_portfolio_overview(portfolio)
        portfolio_overviews.append(overview)

        combined_portfolio_value += overview['market_value']

    for overview in portfolio_overviews:
        if combined_portfolio_value == 0:
            overview['weight'] = 0
        else:
            overview['weight'] = overview['market_value'] / combined_portfolio_value

    data = {
        'portfolios': portfolio_overviews
    }

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_combined_portfolio_overview(request):
    user_portfolios = Portfolio.objects.filter(user=request.user.id)

    portfolio_overviews = []
    for portfolio in user_portfolios:
        portfolio_overviews.append(get_portfolio_overview(portfolio))

    data = {
        'market_value' : sum([p['market_value'] for p in portfolio_overviews]),
        'cost_basis' : sum([p['cost_basis'] for p in portfolio_overviews]),
        'today_profit' : sum([p['today_profit'] for p in portfolio_overviews]),
        'total_profit' : sum([p['total_profit'] for p in portfolio_overviews])
    }

    # add percentages
    today_profit_percentage = 0
    total_profit_percentage = 0
    if data['market_value'] != data['today_profit']:
        today_profit_percentage = data['today_profit']/(data['market_value'] - data['today_profit'])
    if data['cost_basis'] != 0:
        total_profit_percentage = data['total_profit']/data['cost_basis']

    data['today_profit_percentage'] = today_profit_percentage
    data['total_profit_percentage'] = total_profit_percentage 

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_portfolio_time_series(request):
    portfolio_id = request.GET.get('portfolio_id')
    portfolio = get_portfolio(portfolio_id)

    if portfolio.privacy and portfolio.user_id != request.user.id:
        return Response(status=status.HTTP_403_FORBIDDEN)

    trades = Trade.objects.filter(portfolio_id=portfolio_id)

    time_series = get_time_series(trades) 

    response = []
    for year, data in time_series.items():
        response.append({
            'year': year,
            'data': data
        })

    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_combined_portfolio_time_series(request):
    trades = Trade.objects.filter(portfolio__user=request.user.id)

    time_series = get_time_series(trades) 

    response = []
    for year, data in time_series.items():
        response.append({
            'year': year,
            'data': data
        })

    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_portfolios(request):
    user_portfolios = Portfolio.objects.filter(user_id=request.user)
    serializer = PortfolioSerializer(user_portfolios, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_combined_portfolio_groupings(request):
    trades = Trade.objects.filter(portfolio__user=request.user.id)

    holdings = get_holdings(trades)

    sectors = defaultdict(float) 
    industries = defaultdict(float) 
    exchanges = defaultdict(float) 
    countries = defaultdict(float)

    for holding in holdings:
        stock = Stock.objects.get(stock_ticker=holding['ticker'])

        sectors[stock.sector] += holding['holding_value']
        industries[stock.industry] += holding['holding_value']
        exchanges[stock.exchange] += holding['holding_value']
        countries[stock.country] += holding['holding_value']

    response = [
        {
            "grouping": "Sector",
            "data_categories": sectors.keys(),
            "data": sectors.values()
        },
        {
            "grouping": "Industry",
            "data_categories": industries.keys(),
            "data": industries.values()
        },
        {
            "grouping": "Country",
            "data_categories": countries.keys(),
            "data": countries.values()
        }, 
        {
            "grouping": "Exchange",
            "data_categories": exchanges.keys(),
            "data": exchanges.values()
        } 
    ]

    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_portfolio_groupings(request):
    portfolio_id = request.GET.get('portfolio_id')
    portfolio = get_portfolio(portfolio_id)
    if portfolio.privacy and portfolio.user_id != request.user.id:
        return Response(status=status.HTTP_403_FORBIDDEN)

    trades = Trade.objects.filter(portfolio=portfolio_id)

    holdings = get_holdings(trades)

    sectors = defaultdict(float) 
    industries = defaultdict(float) 
    exchanges = defaultdict(float) 
    countries = defaultdict(float)

    for holding in holdings:
        stock = Stock.objects.get(stock_ticker=holding['ticker'])

        sectors[stock.sector] += holding['holding_value']
        industries[stock.industry] += holding['holding_value']
        exchanges[stock.exchange] += holding['holding_value']
        countries[stock.country] += holding['holding_value']

    response = [
        {
            "grouping": "Sector",
            "data_categories": sectors.keys(),
            "data": [round(x, 2) for x in sectors.values()]
        },
        {
            "grouping": "Industry",
            "data_categories": industries.keys(),
            "data": [round(x, 2) for x in industries.values()]
        },
        {
            "grouping": "Country",
            "data_categories": countries.keys(),
            "data": [round(x, 2) for x in countries.values()]
        }, 
        {
            "grouping": "Exchange",
            "data_categories": exchanges.keys(),
            "data": [round(x, 2) for x in exchanges.values()]
        } 
    ]

    return Response(response, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_portfolio_stocks(request):
    portfolio_id = request.GET.get('portfolio_id')
    portfolio = get_portfolio(portfolio_id)
    if portfolio.privacy and portfolio.user_id != request.user.id:
        return Response(status=status.HTTP_403_FORBIDDEN)

    stocks = [x[0] for x in Trade.objects.filter(portfolio_id=portfolio_id).values_list('stock').distinct()]

    return Response(stocks, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_combined_portfolio_stocks(request):
    stocks = [x[0] for x in Trade.objects.filter(portfolio__user=request.user).values_list('stock').distinct()]

    return Response(stocks, status=status.HTTP_200_OK)

class CSVUploadView(generics.GenericAPIView):
    """
    Upload CSV of trades and add it to a portfolio
    """

    permission_classes = (IsAuthenticated,) 
    authentication_classes = (TokenAuthentication,) 
    parser_class = (MultiPartParser,)

    trade_fields = ['stock', 'order_type', 'order_price', 'brokerage_fee', 'trade_date', 'quantity']

    def put(self, request):
        trades_file = request.FILES['trades']

        portfolio_id = request.data.get('portfolio_id')

        header_map = {}
        for field in self.trade_fields:
            header_map[field] = request.data.get(field).strip()

        portfolio = get_portfolio(portfolio_id)
        self.check_object_permissions(self.request, portfolio)

        trades = []
        for chunk in trades_file.chunks():
            with io.StringIO(chunk.decode('utf-8')) as csv_file:
                reader = csv.DictReader(csv_file)

                if not set(header_map.values()) <= set(reader.fieldnames):
                    return Response(data={'response': 'Invalid header names'}, status=status.HTTP_400_BAD_REQUEST)

                for row in reader:
                    trade_data = {
                        'portfolio': portfolio.id,
                        'stock': row[header_map['stock']],
                        'order_type': row[header_map['order_type']][0].upper(),
                        'order_price': row[header_map['order_price']],
                        'brokerage_fee': row[header_map['brokerage_fee']],
                        'trade_date': parse_date(row[header_map['trade_date']], fuzzy=True).strftime("%Y-%m-%d"),
                        'quantity': row[header_map['quantity']]
                    }

                    trades.append(trade_data)

        serializer = TradeCreateSerializer(data=trades, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', ])
@permission_classes([])
@authentication_classes([])
def get_stock_popularity(request):
    stock = request.GET.get('stock')

    if not Stock.objects.filter(stock_ticker=stock).exists():
        return Response(response={'response': "The stock doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

    stock_obj = Stock.objects.get(stock_ticker=stock)

    users_owning_stock = get_users_owning_stock(stock)
    return Response({'users': len(users_owning_stock), 'stock_name': stock_obj.stock_name}, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([])
def get_popular_stocks(request):
    count = request.GET.get('count')

    traded_stocks = [x[0] for x in Trade.objects.all().values_list('stock').distinct()]

    traded_count = {}
    for stock in traded_stocks:
        users_owning_stock = get_users_owning_stock(stock)
        traded_count[stock] = len(users_owning_stock)
    popular_stocks = sorted(traded_count.items(), key=lambda item: item[1])

    if count is None:
        count = 5
    else:
        count = int(count)

    return Response({'popular_stocks': popular_stocks[-min(count, len(popular_stocks)):]}, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([])
def get_high_performing_portfolios(request):
    count = request.GET.get('count')

    portfolio_performance = {}
    for portfolio in Portfolio.objects.filter(privacy = False):
        if (portfolio.user.privacy != True):
            trades = Trade.objects.filter(portfolio=portfolio)
            portfolio_performance[portfolio] = get_holding_value_change(trades)

    top_daily = [{'portfolio_id': x[0].id, 'portfolio_name': x[0].portfolio_name, 'user_id': x[0].user_id, 'username': x[0].user.username, 'profit': x[1]['day_profit']} for x in sorted(portfolio_performance.items(), key=lambda item: item[1]['day_profit'])]
    top_weekly = [{'portfolio_id': x[0].id, 'portfolio_name': x[0].portfolio_name, 'user_id': x[0].user_id, 'username': x[0].user.username, 'profit': x[1]['week_profit']} for x in sorted(portfolio_performance.items(), key=lambda item: item[1]['week_profit'])]
    top_monthly = [{'portfolio_id': x[0].id, 'portfolio_name': x[0].portfolio_name, 'user_id': x[0].user_id, 'username': x[0].user.username, 'profit': x[1]['month_profit']} for x in sorted(portfolio_performance.items(), key=lambda item: item[1]['month_profit'])]

    data = {
        'daily': list(filter(lambda x: x['profit'] != 0, top_daily)),
        'weekly': list(filter(lambda x: x['profit'] != 0, top_weekly)),
        'monthly': list(filter(lambda x: x['profit'] != 0, top_monthly)),
    }

    if count is None:
        count = 5
    else:
        count = int(count)

    data['daily'] = data['daily'][-min(count, len(data['daily'])):]
    data['weekly'] = data['weekly'][-min(count, len(data['weekly'])):]
    data['monthly'] = data['monthly'][-min(count, len(data['monthly'])):]

    return Response(data, status=status.HTTP_200_OK)
