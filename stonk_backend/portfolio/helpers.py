import requests
import asyncio

from trade.models import Trade 
from portfolio.models import Portfolio
from stock.models import Stock 
from user.models import Followed_Portfolio_Data

from datetime import datetime, date, timedelta
from alpha_vantage.async_support.timeseries import TimeSeries

API_KEY = "HRHSV3RY4TUAZ7QH"

def position_info(trades):
    """
    Get the total gains from all sell trades, and the cost basis and units of the remaining position 
    """
    trades = trades.order_by('trade_date', 'order_type')

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

def fetch_quote_data(stocks):
    async def get_data(stock):
        ts = TimeSeries(key=API_KEY)
        data, _ = await ts.get_quote_endpoint(symbol=stock.stock_ticker)
        await ts.close()
        return (stock.stock_ticker, data)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tasks = [get_data(stock) for stock in stocks]
    group = asyncio.gather(*tasks)
    return dict(loop.run_until_complete(group))

def get_holdings(trades):
    stocks = trades.values_list('stock', flat=True).distinct()
    stocks = [Stock.objects.get(stock_ticker=s) for s in stocks]

    data = []
    portfolio_value = 0

    try:
        quote_data = fetch_quote_data(stocks)
    except:
        quote_data = fetch_quote_data(stocks)

    for stock in stocks:
        position = position_info(trades.filter(stock=stock))

        # Get the current market price of the stock
        quote = quote_data[stock.stock_ticker]
        market_price = float(quote["05. price"])
        previous_close = float(quote["08. previous close"])
        change = float(quote["09. change"])
        change_percent = quote["10. change percent"]

        # Compute profit stats
        profit = (market_price * position['units']) - position['cost']
        profit_percentage = profit / position['cost'] if position['cost'] > 0 else 0

        portfolio_value += market_price * position['units']

        data.append({
            'ticker': stock.stock_ticker,
            'name': stock.stock_name,
            'units': position['units'],
            'cost_basis': position['cost'],
            'market_price': market_price,
            'holding_value': market_price * position['units'],
            'profit': profit,
            'profit_percentage': profit_percentage,
            'market_price_change': change,
            'market_price_percentage_change': change / (market_price - change),
            'holding_value_change': change * position['units']
        })

    # Add the weighting of each stock
    for d in data:
        d['weight'] = d['holding_value'] / portfolio_value

    return data

def get_portfolio_overview(portfolio):
    market_value = profit = value_change = cost_basis = 0

    trades = Trade.objects.filter(portfolio_id=portfolio.id)
    holdings = get_holdings(trades)
    for holding in holdings:
        market_value += holding['holding_value']
        profit += holding['profit']
        value_change += holding['holding_value_change']
        cost_basis += holding['cost_basis']
    

    today_profit_percentage = 0
    total_profit_percentage = 0
    if market_value != value_change:
        today_profit_percentage = value_change/(market_value - value_change)
    if cost_basis != 0:
        total_profit_percentage = profit/cost_basis

    following = Followed_Portfolio_Data.objects.filter(portfolio = portfolio.id)

    return {
        'portfolio_id': portfolio.id,
        'portfolio_name': portfolio.portfolio_name,
        'user_id': portfolio.user_id,
        'privacy': portfolio.privacy,
        'market_value': market_value,
        'cost_basis': cost_basis,
        'today_profit': value_change,
        'today_profit_percentage': today_profit_percentage,
        'total_profit': profit,
        'total_profit_percentage': total_profit_percentage ,
        'num_following': len(following)
    }

def fetch_time_series_data(stocks, outputsize='full'):
    async def get_data(stock):
        ts = TimeSeries(key=API_KEY)
        data, _ = await ts.get_daily_adjusted(symbol=stock.stock_ticker, outputsize=outputsize)
        await ts.close()
        return (stock.stock_ticker, data)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tasks = [get_data(stock) for stock in stocks]
    group = asyncio.gather(*tasks)
    return dict(loop.run_until_complete(group))

def get_time_series(trades):
    if not trades:
        return {}

    earliest_date = min(trades.values_list('trade_date', flat=True))

    stocks = trades.values_list('stock', flat=True).distinct()
    stocks = [Stock.objects.get(stock_ticker=s) for s in stocks]

    portfolio_value = {} 
    portfolio_profit = {} 

    time_series_data = fetch_time_series_data(stocks)

    for stock in stocks:
        time_series = time_series_data[stock.stock_ticker]
        time_series = {datetime.strptime(k, "%Y-%m-%d").date(): v for k, v in time_series.items() if datetime.strptime(k, "%Y-%m-%d").date() >= earliest_date}

        trade_dates = set(trades.filter(stock=stock).values_list('trade_date', flat=True))

        prev_position = {'units': 0, 'cost': 0, 'gains_from_sale': 0}
        for date, price_data in reversed(time_series.items()):
            if date in trade_dates:
                position = position_info(trades.filter(stock=stock).filter(trade_date__lte=date))
                holding_value = position['units'] * float(price_data['5. adjusted close'])
                profit = holding_value - position['cost'] + position['gains_from_sale']

                prev_position = position
            else:
                holding_value = prev_position['units'] * float(price_data['5. adjusted close'])
                profit = holding_value - prev_position['cost'] + prev_position['gains_from_sale']

            date_string = date.strftime("%Y-%m-%d")
            if date_string not in portfolio_value:
                portfolio_value[date_string] = 0
            portfolio_value[date_string] += holding_value

            if date_string not in portfolio_profit:
                portfolio_profit[date_string] = 0
            portfolio_profit[date_string] += profit 

    # Group value by the year
    year_grouped = {} 
    for date in portfolio_value:
        year = datetime.strptime(date, "%Y-%m-%d").year
        if year not in year_grouped:
            year_grouped[year] = {'value': [], 'profit': []}

        formatted_date = datetime.strptime(date, "%Y-%m-%d").strftime("%m-%d-%Y GMT")
        year_grouped[year]['value'].append((formatted_date, round(portfolio_value[date], 2)))
        year_grouped[year]['profit'].append((formatted_date, round(portfolio_profit[date], 2)))

    return year_grouped

def get_holding_value_change(trades):
    stocks = trades.values_list('stock', flat=True).distinct()
    stocks = [Stock.objects.get(stock_ticker=s) for s in stocks]

    today = date.today()
    day_ago = today - timedelta(days=1)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(weeks=4)

    day_profit = 0
    week_profit = 0
    month_profit = 0

    day_cost_basis = 0
    week_cost_basis = 0
    month_cost_basis = 0

    time_series_data = fetch_time_series_data(stocks, 'compact')
    for stock in stocks:
        time_series = list(time_series_data[stock.stock_ticker].items())

        today_position = position_info(trades.filter(stock=stock))
        day_ago_position = position_info(trades.filter(stock=stock).filter(trade_date__lte=day_ago))
        week_ago_position = position_info(trades.filter(stock=stock).filter(trade_date__lte=week_ago))
        month_ago_position = position_info(trades.filter(stock=stock).filter(trade_date__lte=month_ago))

        today_price = float(time_series[0][1]['5. adjusted close'])
        day_ago_price = float(time_series[1][1]['5. adjusted close'])
        week_ago_price = float(time_series[5][1]['5. adjusted close'])
        month_ago_price = float(time_series[20][1]['5. adjusted close'])

        today_holding = today_position['units'] * today_price
        day_ago_holding = day_ago_position['units'] * day_ago_price
        week_ago_holding = week_ago_position['units'] * week_ago_price
        month_ago_holding = month_ago_position['units'] * month_ago_price 

        day_profit += today_holding - day_ago_holding - (today_position['cost'] - day_ago_position['cost']) + today_position['gains_from_sale'] - day_ago_position['gains_from_sale']
        week_profit += today_holding - week_ago_holding - (today_position['cost'] - week_ago_position['cost']) + today_position['gains_from_sale'] - week_ago_position['gains_from_sale']
        month_profit += today_holding - month_ago_holding - (today_position['cost'] - month_ago_position['cost']) + today_position['gains_from_sale'] - month_ago_position['gains_from_sale']

        day_cost_basis += day_ago_holding 
        week_cost_basis += week_ago_holding 
        month_cost_basis += month_ago_holding 

    return {
        'day_profit': 0 if day_cost_basis == 0 else day_profit/day_cost_basis,
        'week_profit': 0 if week_cost_basis == 0 else week_profit/week_cost_basis,
        'month_profit': 0 if month_cost_basis == 0 else month_profit/month_cost_basis
    }
        

def get_users_owning_stock(stock):
    return Trade.objects.filter(stock=stock).values_list('portfolio__user').distinct()