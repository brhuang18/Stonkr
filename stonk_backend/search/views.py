from django.shortcuts import render
from django.http import HttpRequest
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import requests
from datetime import datetime
from stock.models import Stock
from account.models import Account
from watchlist.models import Watchlist
from watchlist.serializers import WatchlistViewSerializer
from portfolio.models import Portfolio
from portfolio.helpers import get_portfolio_overview
from user.models import Followed_Watchlist_Data, Followed_Portfolio_Data
from account.serializers import AccountViewSerializer

api_key = 'HRHSV3RY4TUAZ7QH'

@api_view(["GET"])
@permission_classes([])
@authentication_classes([])
def summary_view(request):
    ticker = request.GET.get("stock_ticker")

    try:
        Stock.objects.get(pk = ticker)
    #if the stock does not exist
    except Stock.DoesNotExist:
        return Response({'response': "Enter a valid stock id."}, status=status.HTTP_400_BAD_REQUEST)

    #OVERVIEW CALL
    overview_url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol='+ticker+'&apikey='+api_key
    overview_request = requests.get(overview_url)
    overview_data = overview_request.json()

    #TIME SERIES DAILY CALL
    ts_daily_url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ticker+'&apikey='+api_key
    daily_request = requests.get(ts_daily_url)
    daily_data = daily_request.json()

    res = {}
    if(overview_data and daily_data):
        res['Response'] = "Successful retrieval of stock summary"

        #isolate time series data
        ts_data = daily_data.get('Time Series (Daily)')
        #key for the previous days time series data
        prev_date = list(ts_data)[0]
        prev_day_data = ts_data.get(prev_date)

        information = {
            'Symbol' : overview_data.get('Symbol'),
            'AssetType' : overview_data.get('AssetType'),
            'Name' : overview_data.get('Name'),
            'Description' : overview_data.get('Description'),
            'Exchange' : overview_data.get('Exchange'),
            'Currency' : overview_data.get('Currency'),
            'Country' : overview_data.get('Country'),
            'Sector' : overview_data.get('Sector'),
            'Industry' : overview_data.get('Industry')
        }
        metrics = {
            'Open' : prev_day_data.get('1. open'),
            'Range' : str(prev_day_data.get('3. low'))+' - '+str(prev_day_data.get('2. high')),
            'Close' : prev_day_data.get('4. close'),
            'Volume' : prev_day_data.get('5. volume'),
            'MarketCapitalization' : overview_data.get('MarketCapitalization'),
            'Beta' : overview_data.get('Beta'),
            'PERatio' : overview_data.get('PERatio'),
            'EPS' : overview_data.get('EPS'),
            'ExDividendDate' : overview_data.get('ExDividendDate'),
            'DividendYield' :overview_data.get('DividendYield')
        }
        res['Information'] = information
        res['Metrics'] = metrics
    else:
        res['Response'] = 'Could not retrieve stock summary'
        return Response(res, status=status.HTTP_404_NOT_FOUND)

    return Response(res, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([])
@authentication_classes([])
def statistics_view(request):
    ticker = request.GET.get("stock_ticker")

    try:
        Stock.objects.get(pk = ticker)
    #if the stock does not exist
    except Stock.DoesNotExist:
        return Response({'response': "Enter a valid stock id."}, status=status.HTTP_400_BAD_REQUEST)
    
    #OVERVIEW CALL
    overview_url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol='+ticker+'&apikey='+api_key
    overview_request = requests.get(overview_url)
    overview_data = overview_request.json()

    #INCOME STATEMENT CALL
    income_url = 'https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol='+ticker+'&apikey='+api_key
    income_request = requests.get(income_url)
    income_data = income_request.json()

    #BALANCE SHEET CALL
    balance_url = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol='+ticker+'&apikey='+api_key
    balance_request = requests.get(balance_url)
    balance_data = balance_request.json()

    #CASH FLOW CALL
    cash_url = 'https://www.alphavantage.co/query?function=CASH_FLOW&symbol='+ticker+'&apikey='+api_key
    cash_request = requests.get(cash_url)
    cash_data = cash_request.json()

    res = {}
    if(overview_data and income_data and balance_data and cash_data):
        res['Response'] = "Successful retrieval of stock statistics"

        income_statement_data = income_data.get('annualReports')[0]
        balance_sheet_data = balance_data.get('annualReports')[0]
        cash_flow_statement_data = cash_data.get('annualReports')[0]

        evaluation_measures = {
            'MarketCapitalization' : overview_data.get('MarketCapitalization'),
            'TrailingPE' : overview_data.get('TrailingPE'),
            'ForwardPE' : overview_data.get('ForwardPE'),
            'PEGRatio' : overview_data.get('PEGRatio'),
            'PriceToSalesRatioTTM' : overview_data.get('PriceToSalesRatioTTM'),
            'PriceToBookRatio' : overview_data.get('PriceToBookRatio')
        }

        fiscal_year = {
            'FiscalYearEnd' : overview_data.get('FiscalYearEnd'),
            'LatestQuarter' : overview_data.get('LatestQuarter')
        }

        profitability = {
            'ProfitMargin' : overview_data.get('ProfitMargin'),
            'OperatingMarginTTM' : overview_data.get('OperatingMarginTTM')
        }

        management_effectiveness = {
            'ReturnOnAssetsTTM' : overview_data.get('ReturnOnAssetsTTM'),
            'ReturnOnEquityTTM' : overview_data.get('ReturnOnEquityTTM')
        }

        income_statement = {
            'TotalRevenue' : income_statement_data.get('totalRevenue'),
            'RevenuePerShareTTM' : overview_data.get('RevenuePerShareTTM'),
            'QuarterlyRevenueGrowthYOY' : overview_data.get('QuarterlyRevenueGrowthYOY'),
            'GrossProfitTTM' : overview_data.get('GrossProfitTTM'),
            'EBITDA' : overview_data.get('EBITDA'),
            'DilutedEPSTTM' : overview_data.get('DilutedEPSTTM'),
            'QuarterlyEarningsGrowthYOY' : overview_data.get('QuarterlyEarningsGrowthYOY')
        }

        balance_sheet = {
            'TotalAssets' : balance_sheet_data.get('totalAssets'),
            'TotalCurrentAssets' : balance_sheet_data.get('totalCurrentAssets'),
            'CashAndCashEquivalentsAtCarryingValue' : balance_sheet_data.get('cashAndCashEquivalentsAtCarryingValue'),
            'CashAndShortTermInvestments' : balance_sheet_data.get('cashAndShortTermInvestments'),
            'Inventory' : balance_sheet_data.get('inventory'),
            'TotalLiabilities' : balance_sheet_data.get('totalLiabilities'),
            'TotalCurrentLiabilities' : balance_sheet_data.get('totalCurrentLiabilities'),
            'TotalShareholderEquity' : balance_sheet_data.get('totalShareholderEquity'),
            'RetainedEarnings' : balance_sheet_data.get('retainedEarnings'),
            'CommonStock' : balance_sheet_data.get('commonStock'),
        }

        cash_flow_statement = {
            'OperatingCashflow': cash_flow_statement_data.get('operatingCashflow'),
            'CashflowFromInvestment' : cash_flow_statement_data.get('cashflowFromInvestment')
        }

        stock_price_history = {
            'Beta' : overview_data.get('Beta'),
            '52WeekChange' : str((float(overview_data.get('52WeekHigh'))-float(overview_data.get('52WeekLow')))/float(overview_data.get('52WeekLow'))*100),
            '52WeekHigh' : overview_data.get('52WeekHigh'),
            '52WeekLow' : overview_data.get('52WeekLow'),
            '50DayMovingAverage' : overview_data.get('50DayMovingAverage'),
            '200DayMovingAverage' : overview_data.get('200DayMovingAverage'),
        }

        share_statistics = {
            'SharesOutstanding' : overview_data.get('Beta'),
            'SharesFloat' : overview_data.get('SharesFloat'),
            'PercentInsiders' : overview_data.get('PercentInsiders'),
            'PercentInstitutions' : overview_data.get('PercentInstitutions'),
            'SharesShort' : overview_data.get('SharesShort'),
            'ShortRatio' : overview_data.get('ShortRatio'),
            'ShortPercentFloat' : overview_data.get('ShortPercentFloat'),
            'ShortPercentOutstanding' : overview_data.get('ShortPercentOutstanding'),
        }

        dividends_splits = {
            'ForwardAnnualDividendRate' : overview_data.get('ForwardAnnualDividendRate'), 
            'ForwardAnnualDividendYield' : overview_data.get('ForwardAnnualDividendYield'),
            'PayoutRatio' : overview_data.get('PayoutRatio'),
            'DividendDate' : overview_data.get('DividendDate'),
            'ExDividendDate' : overview_data.get('ExDividendDate'),
            'LastSplitFactor' : overview_data.get('LastSplitFactor'),
            'LastSplitDate' : overview_data.get('LastSplitDate'),
        }

        financial_highlights = {
            'FiscalYear' : fiscal_year,
            'Profitability' : profitability,
            'ManagementEffectiveness' : management_effectiveness,
            'IncomeStatement' : income_statement,
            'BalanceSheet' : balance_sheet,
            'CashflowStatement' :cash_flow_statement,
        }

        trading_information = {
            'StockPriceHistory' : stock_price_history,
            'ShareStatistics' : share_statistics,
            'DividendsAndSplits' :dividends_splits,
        }

        res['EvaluationMeasures'] = evaluation_measures
        res['FinancialHighlights'] = financial_highlights
        res['TradingInformation'] = trading_information

    else:
        res['Response'] = 'Could not retrieve stock statistics'
        return Response(res, status=status.HTTP_404_NOT_FOUND)

    return Response(res, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([])
@authentication_classes([])
def histdata_view(request):
    ticker = request.GET.get("stock_ticker")
    request_type = request.GET.get("request_type")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    adj = request.GET.get("adj")

    try:
        Stock.objects.get(pk = ticker)
    #if the stock does not exist
    except Stock.DoesNotExist:
        return Response({'response': "Enter a valid stock id."}, status=status.HTTP_400_BAD_REQUEST)

    res = {}

    today_date = datetime.today().strftime('%Y-%m-%d')
    #check start date < end date
    if start_date > end_date:
        res['Response'] = 'Ensure that start date < end date.'
        return Response(res, status=status.HTTP_400_BAD_REQUEST)
    #check start_date and end_date < today
    if start_date > today_date or end_date > today_date:
        res['Response'] = 'Ensure that start date and end date < current date.'
        return Response(res, status=status.HTTP_400_BAD_REQUEST)

    #TIME SERIES ... CALL
    if adj:
        ts_url = 'https://www.alphavantage.co/query?function=TIME_SERIES_'+request_type+'_ADJUSTED'+'&outputsize=full'+'&symbol='+ticker+'&apikey='+api_key
    else:
        ts_url = 'https://www.alphavantage.co/query?function=TIME_SERIES_'+request_type+'&symbol='+ticker+'&outputsize=full'+'&apikey='+api_key
    ts_request = requests.get(ts_url)
    ts_data = ts_request.json()

    if(ts_data):
        res['Response'] = "Successful retrieval of historical data"

        #isolate time series data
        ts_data_name = list(ts_data)[1]
        ts_data = ts_data[ts_data_name]

        histdata_dicts = []

        for i in range(len(ts_data)):
            if list(ts_data)[i] >= start_date and list(ts_data)[i] <= end_date:
                temp = {}
                specific_date = list(ts_data)[i]
                date_data = ts_data.get(specific_date)
                temp['0. date'] = specific_date
                temp['1. open'] = date_data.get('1. open')
                temp['2. high'] = date_data.get('2. high')
                temp['3. low'] = date_data.get('3. low')
                temp['4. close'] = date_data.get('4. close')
                if adj:
                    temp['5. volume'] = date_data.get('6. volume')
                    temp['6. adjusted close'] = date_data.get('5. adjusted close')
                else:
                    temp['5 volume'] = date_data.get('5. volume')
                histdata_dicts.append(temp)
        res['Historical Data'] = histdata_dicts
    else:
        res['Response'] = 'Could not retrieve historical data'
        return Response(res, status=status.HTTP_404_NOT_FOUND)

    return Response(res, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([])
def get_user_view(request):
    user_id = request.GET.get('user')

    try:
        user = Account.objects.get(pk = user_id)
    #if the user does not exist
    except Account.DoesNotExist:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST)

    data = {}
    if user.privacy:
        data['response'] = 'Private'
    else:
        data['response'] = 'Success'
    data['username'] = user.username
    data['first_name'] = user.first_name
    data['last_name'] = user.last_name
    if user.privacy:
        data['email'] = ""
    else:
        data['email'] = user.email

    if not user.privacy:
        followed_watchlists = Followed_Watchlist_Data.objects.filter(user = user_id)
        followed_portfolios = Followed_Portfolio_Data.objects.filter(user = user_id)

        data['following'] = len(followed_portfolios) + len(followed_watchlists)

        user_watchlists = Watchlist.objects.filter(user = user)
        user_portfolios = Portfolio.objects.filter(user = user)
        num_followers = 0
        for w in user_watchlists:
            watchlist_followers = Followed_Watchlist_Data.objects.filter(watchlist = w.pk)
            num_followers += len(watchlist_followers)
        for p in user_portfolios:
            portfolio_followers = Followed_Portfolio_Data.objects.filter(portfolio = p.pk)
            num_followers += len(portfolio_followers)
        data['followers'] = num_followers
    else:
        data['following'] = ""
        data['followers'] = ""

    return Response(data, status = status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([])
def get_all_users_view(request):
    
    users = Account.objects.all()
    
    #serialize the watchlists
    userSet = [AccountViewSerializer(u).data for u in users]
    
    non_super = []
    for u in userSet:
        user = Account.objects.get(pk = u.get('id'))
        if not user.is_superuser:
            non_super.append(u)

        if not user.privacy:
            user_watchlists = Watchlist.objects.filter(user = user)
            user_portfolios = Portfolio.objects.filter(user = user)
            num_followers = 0
            for w in user_watchlists:
                watchlist_followers = Followed_Watchlist_Data.objects.filter(watchlist = w.pk)
                num_followers += len(watchlist_followers)
            for p in user_portfolios:
                portfolio_followers = Followed_Portfolio_Data.objects.filter(portfolio = p.pk)
                num_followers += len(portfolio_followers)
            u['followers'] = num_followers 
        else:
            u['followers'] = -1  

    return Response(data = {'users':non_super}, status = status.HTTP_200_OK)


@api_view(['GET', ])
@permission_classes([])
def search_endpoint_view(request):
    keywords = request.GET.get('keywords')

    request_url = f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={keywords}&apikey={api_key}'
    request = requests.get(request_url)
    data = request.json()

    filtered_matches = []
    for match in data['bestMatches']:
        stock = match['1. symbol']
        if Stock.objects.filter(stock_ticker=stock).exists():
            filtered_matches.append(match)
    
    return Response({'bestMatches': filtered_matches}, status = status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([])
def get_followers_view(request):
    user_id = request.GET.get('user')
    
    try:
        user = Account.objects.get(pk = user_id)
    #if the user does not exist
    except Account.DoesNotExist:
        return Response({'response': "Enter a valid user id."}, status=status.HTTP_400_BAD_REQUEST)
    
    followers = []
    if not user.privacy:
        user_watchlists = Watchlist.objects.filter(user = user_id)
        user_portfolios = Portfolio.objects.filter(user = user_id)
        for w in user_watchlists:
            watchlist_followers = Followed_Watchlist_Data.objects.filter(watchlist = w.pk)
            for wf in watchlist_followers:
                follower = Account.objects.get(pk = wf.user.pk)
                f = {
                    'user_id':follower.pk,
                    'username':follower.username,
                    'first_name': follower.first_name,
                    'last_name': follower.last_name,
                    'privacy': follower.privacy
                }
                if f not in followers:
                    followers.append(f)
        for p in user_portfolios:
            portfolio_followers = Followed_Portfolio_Data.objects.filter(portfolio = p.pk)
            for pf in portfolio_followers:
                follower = Account.objects.get(pk = pf.user.pk)
                f = {
                    'user_id':follower.pk,
                    'username':follower.username,
                    'first_name': follower.first_name,
                    'last_name': follower.last_name,
                    'privacy': follower.privacy
                }
                if f not in followers:
                    followers.append(f)
    
    return Response(data = {'followers':followers}, status = status.HTTP_200_OK)