from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import screener.helpers as helper
from stock.models import Stock

import requests
import json
import psycopg2
import time

def get_screener(screener_name, offset = 0):
    #retrieve screener_info object
    s = helper.get_screener(screener_name, offset)
    #perform yahoo api call
    response = requests.request("POST", s.url, headers=s.headers, data=s.payload)
    return json.loads(response.text)

def get_screener_stocks(info, data):
    quotes = info['finance']['result'][0]['quotes']

    stock_list = data

    try:
        #setup connection to the db
        connection = psycopg2.connect(user="postgres",
                                    password="3900-H18B-Carlo",
                                    host="comp3900-stonk-backend.chbllirfhnpu.ap-southeast-2.rds.amazonaws.com",
                                    port="5432",
                                    database="mydb")
        cursor = connection.cursor()
        #query for stock_tickers
        postgreSQL_select_Query = "select stock_ticker from stock_stock"
        cursor.execute(postgreSQL_select_Query)
        #list of tuples containing stock_tickers
        stock_records = cursor.fetchall()
        #list of stock_tickers
        stock_records = [item for t in stock_records for item in t]

        for i in range(len(quotes)):
            if quotes[i]['symbol'] in stock_records:
                #if it does continue adding it to stock_list
                temp = {}        
                temp['stock_ticker'] = quotes[i]['symbol']
                temp['stock_name'] = quotes[i]['shortName']
                temp['stock_price'] = quotes[i]['regularMarketPrice']['raw']
                temp['value_change'] = quotes[i]['regularMarketChange']['raw']
                temp['percent_change'] = quotes[i]['regularMarketChangePercent']['raw']
                temp['volume'] = quotes[i]['regularMarketVolume']['raw']
                temp['avg_3_month_volume'] = quotes[i]['averageDailyVolume3Month']['raw']
                if 'marketCap' in quotes[i]:
                    temp['market_cap'] = quotes[i]['marketCap']['raw']
                else:
                    temp['market_cap'] = 'N/A'
                if 'trailingPE' in quotes[i]:
                    temp['PE_ratio'] = quotes[i]['trailingPE']['raw']
                else:
                    temp['PE_ratio'] = 'N/A'
                temp['52_week_range_low'] = quotes[i]['fiftyTwoWeekLow']['raw']
                temp['52_week_range_high'] = quotes[i]['fiftyTwoWeekHigh']['raw']
                if(len(stock_list) < 100):
                    stock_list.append(temp)
                else:
                    break
    except (Exception, psycopg2.Error) as error:
        print("Error while fetching data from PostgreSQL", error)

    finally:
        # closing database connection
        if connection:
            cursor.close()
            connection.close()

    return stock_list

# Create your views here.
@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def get_view(request):
    screener_name = request.GET.get('screener_name')
    if screener_name not in helper.screeners:
        return Response({'response':'Enter valid screener name.'}, status = status.HTTP_400_BAD_REQUEST)
    data = []
    #counter for offset
    offset = 0
    #initialisation for total number of stocks in the screener
    info = get_screener(screener_name, offset)
    total = info['finance']['result'][0]['total']
    #loop until data is 100, or we are at the end of the screeener list
    while len(data) < 100 and offset < total:
        #fetch yahoo finance screener info
        if offset != 0:
            info = get_screener(screener_name, offset) 
        data = get_screener_stocks(info, data)
        #increase offset if the data isn't at 100 stocks
        offset += 100
    #reset offset
    helper.reset_offset(screener_name)
    temp = {}
    temp['screener_name'] = screener_name
    temp['description'] = helper.screeners[screener_name].desc
    temp['screener_list'] = data

    return Response(temp, status = status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def get_all_view(request):
    data_all = []
    #loop for each screener
    for screener_name in helper.screeners:
        data = []
        #counter for offset
        offset = 0
        #initialisation for total number of stocks in the screener
        info = get_screener(screener_name, offset)
        total = info['finance']['result'][0]['total']
        #loop until data is 100, or we are at the end of the screeener list
        while len(data) < 100 and offset < total:
            if offset != 0:
                info = get_screener(screener_name, offset)
            data = get_screener_stocks(info, data)
            #increase offset if the data isn't at 100 stocks
            offset += 100
        #reset offset
        helper.reset_offset(screener_name)
        temp = {}
        temp['screener_name'] = screener_name
        temp['description'] = helper.screeners[screener_name].desc
        temp['screener_count'] = len(data)
        data_all.append(temp)

    return Response({'screeners':data_all}, status = status.HTTP_200_OK)
