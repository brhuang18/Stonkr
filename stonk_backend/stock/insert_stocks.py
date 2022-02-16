import csv
from stock.models import Stock

def insert_nasdaq():
    path = "nasdaq_csv/nasdaq_screener_1633271817308.csv"
    with open(path) as f:
            reader = csv.reader(f)
            for row in reader:
                if (row[0] != "Symbol"):
                    tmp_obj, created = Stock.objects.update_or_create(
                        # stock_ticker=row[0],
                        # stock_type = "common stock",
                        # stock_name = row[1],
                        # exchange="NASDAQ",
                        # country=row[6],
                        # sector = row[9],
                        # industry = row[10]
                        stock_ticker=row[0].rstrip(),
                        defaults = {
                            "stock_type" : "common stock",
                            "stock_name" : row[1],
                            "exchange" : "NASDAQ",
                            "country" : row[6],
                            "sector" : row[9],
                            "industry" : row[10]
                        }
                    )
                    print(tmp_obj, created)
                    # creates a tuple of the new object or
                    # current object and a boolean of if it was created
                    # stock_ticker=row[0]
                    # stock_type = "common stock"
                    # exchange="NASDAQ"
                    # country=row[6]
                    # sector = row[9]
                    # industry = row[10]
                    # counter += 1
                    # print(f"stock_ticker = {stock_ticker}, stock_type = {stock_type}, exchange = {exchange}, country = {country}, sector = {sector}, industry = {industry}")

def insert_nyse():
    path = "nyse_csv/nasdaq_screener_1633271908035.csv"
    with open(path) as f:
            reader = csv.reader(f)
            for row in reader:
                if (row[0] != "Symbol"):
                    tmp_obj, created = Stock.objects.update_or_create(
                        # stock_ticker=row[0],
                        # stock_type = "common stock",
                        # stock_name = row[1],
                        # exchange="NYSE",
                        # country=row[6],
                        # sector = row[9],
                        # industry = row[10]
                        stock_ticker=row[0].rstrip(),
                        defaults = {
                            "stock_type" : "common stock",
                            "stock_name" : row[1],
                            "exchange" : "NYSE",
                            "country" : row[6],
                            "sector" : row[9],
                            "industry" : row[10]
                        }
                    )
                    print(tmp_obj, created)
                    # creates a tuple of the new object or
                    # current object and a boolean of if it was created
                    

insert_nasdaq()
insert_nyse()