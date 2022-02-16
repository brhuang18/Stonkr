import json

class Screener_Info:
    def __init__(self, url, payload, headers, desc):
        self.url = url
        self.payload = payload
        self.headers = headers
        self.curr_offset = 0
        self.desc = desc

#get function to decide if offset should be applied
def get_screener(screener_name, offset):
    if offset != 0:
        return update_offset(screener_name, offset)
    else:
        return screeners[screener_name]

#reset function to reset all data to a 0 offset
def reset_offset(screener_name):
    update_offset(screener_name, 0)
    return

#updates screener offset
def update_offset(screener_name, offset):
    info = screeners[screener_name]
    #update offset in payload
    p = json.loads(info.payload)
    p['offset'] = offset
    info.payload = json.dumps(p)
    #update offset in referer header
    ref = info.headers['referer']
    replaced_ref = ref.replace('offset='+str(info.curr_offset),'offset='+str(offset))
    info.headers['referer'] = replaced_ref
    info.curr_offset = offset
    return info

#most shorted stocks screener 
most_shorted_stocks = Screener_Info(
    url = "https://query1.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
        "size": 100,
        "offset": 0,
        "sortField": "short_percentage_of_shares_outstanding.value",
        "sortType": "DESC",
        "quoteType": "EQUITY",
        "topOperator": "AND",
        "query": {
            "operator": "AND",
            "operands": [
            {
                "operator": "or",
                "operands": [
                {
                    "operator": "EQ",
                    "operands": [
                    "region",
                    "us"
                    ]
                }
                ]
            },
            {
                "operator": "gt",
                "operands": [
                "intradayprice",
                1
                ]
            },
            {
                "operator": "gt",
                "operands": [
                "avgdailyvol3m",
                200000
                ]
            }
            ]
        },
        "userId": "",
        "userIdType": "guid"
    }),
    headers = {
        'authority': 'query1.finance.yahoo.com',
        'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"',
        'content-type': 'application/json',
        'accept': '*/*',
        'origin': 'https://finance.yahoo.com',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://finance.yahoo.com/screener/predefined/most_shorted_stocks?count=100&offset=0',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635378677&j=0; APIDTS=1635379871'
    },
    desc = 'Stocks with the highest short interest positions ordered by short % of shares outstanding from Nasdaq and NYSE reports released every two weeks.'
)

undervalued_growth_stocks = Screener_Info(
    url = "https://query1.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortType": "DESC",
    "sortField": "eodvolume",
    "quoteType": "EQUITY",
    "query": {
        "operator": "and",
        "operands": [
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "peratio.lasttwelvemonths",
                0,
                20
                ]
            }
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "LT",
                "operands": [
                "pegratio_5y",
                1
                ]
            }
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "epsgrowth.lasttwelvemonths",
                25,
                50
                ]
            },
            {
                "operator": "BTWN",
                "operands": [
                "epsgrowth.lasttwelvemonths",
                50,
                100
                ]
            },
            {
                "operator": "GT",
                "operands": [
                "epsgrowth.lasttwelvemonths",
                100
                ]
            }
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NMS"
                ]
            },
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NYQ"
                ]
            }
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query1.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/undervalued_growth_stocks?offset=0&count=100',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635391712'
    },
    desc = 'Stocks with earnings growth rates better than 25% and relatively low PE and PEG ratios.'
)

growth_technology_stocks = Screener_Info(
    url = "https://query2.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "eodvolume",
    "sortType": "desc",
    "quoteType": "equity",
    "query": {
        "operator": "and",
        "operands": [
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "quarterlyrevenuegrowth.quarterly",
                25,
                50
                ]
            },
            {
                "operator": "BTWN",
                "operands": [
                "quarterlyrevenuegrowth.quarterly",
                50,
                100
                ]
            },
            {
                "operator": "GT",
                "operands": [
                "quarterlyrevenuegrowth.quarterly",
                100
                ]
            }
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "epsgrowth.lasttwelvemonths",
                25,
                50
                ]
            },
            {
                "operator": "BTWN",
                "operands": [
                "epsgrowth.lasttwelvemonths",
                50,
                100
                ]
            },
            {
                "operator": "GT",
                "operands": [
                "epsgrowth.lasttwelvemonths",
                100
                ]
            }
            ]
        },
        {
            "operator": "eq",
            "operands": [
            "sector",
            "Technology"
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NMS"
                ]
            },
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NYQ"
                ]
            }
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query2.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/growth_technology_stocks?offset=0&count=100',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635391956'
    },
    desc = 'Technology stocks with revenue and earnings growth in excess of 25%.'
)

day_gainers = Screener_Info(
    url = "https://query2.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "percentchange",
    "sortType": "DESC",
    "quoteType": "EQUITY",
    "query": {
        "operator": "AND",
        "operands": [
        {
            "operator": "GT",
            "operands": [
            "percentchange",
            3
            ]
        },
        {
            "operator": "eq",
            "operands": [
            "region",
            "us"
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "intradaymarketcap",
                2000000000,
                10000000000
                ]
            },
            {
                "operator": "BTWN",
                "operands": [
                "intradaymarketcap",
                10000000000,
                100000000000
                ]
            },
            {
                "operator": "GT",
                "operands": [
                "intradaymarketcap",
                100000000000
                ]
            }
            ]
        },
        {
            "operator": "gt",
            "operands": [
            "dayvolume",
            15000
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query2.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/day_gainers?count=100&offset=0',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635392153'
    },
    desc = 'Stocks ordered in descending order by price percent change with respect to the previous close.'
)

day_losers = Screener_Info(
    url = "https://query1.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "percentchange",
    "sortType": "ASC",
    "quoteType": "EQUITY",
    "query": {
        "operator": "AND",
        "operands": [
        {
            "operator": "LT",
            "operands": [
            "percentchange",
            -2.5
            ]
        },
        {
            "operator": "eq",
            "operands": [
            "region",
            "us"
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "intradaymarketcap",
                2000000000,
                10000000000
                ]
            },
            {
                "operator": "BTWN",
                "operands": [
                "intradaymarketcap",
                10000000000,
                100000000000
                ]
            },
            {
                "operator": "GT",
                "operands": [
                "intradaymarketcap",
                100000000000
                ]
            }
            ]
        },
        {
            "operator": "gt",
            "operands": [
            "dayvolume",
            20000
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query1.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/day_losers?count=100&offset=0',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635392153'
    },
    desc = 'Stocks ordered in ascending order by price percent change with respect to the previous close.'
)

most_actives = Screener_Info(
    url = "https://query2.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "dayvolume",
    "sortType": "DESC",
    "quoteType": "EQUITY",
    "query": {
        "operator": "AND",
        "operands": [
        {
            "operator": "eq",
            "operands": [
            "region",
            "us"
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "BTWN",
                "operands": [
                "intradaymarketcap",
                2000000000,
                10000000000
                ]
            },
            {
                "operator": "BTWN",
                "operands": [
                "intradaymarketcap",
                10000000000,
                100000000000
                ]
            },
            {
                "operator": "GT",
                "operands": [
                "intradaymarketcap",
                100000000000
                ]
            }
            ]
        },
        {
            "operator": "gt",
            "operands": [
            "dayvolume",
            5000000
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query2.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/most_actives?offset=0&count=100',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635392153'
    },
    desc = 'Stocks ordered in descending order by intraday trade volume.'
)

undervalued_large_caps = Screener_Info(
    url = "https://query2.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "eodvolume",
    "sortType": "desc",
    "quoteType": "equity",
    "query": {
        "operator": "and",
        "operands": [
        {
            "operator": "btwn",
            "operands": [
            "peratio.lasttwelvemonths",
            0,
            20
            ]
        },
        {
            "operator": "lt",
            "operands": [
            "pegratio_5y",
            1
            ]
        },
        {
            "operator": "btwn",
            "operands": [
            "intradaymarketcap",
            10000000000,
            100000000000
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NMS"
                ]
            },
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NYQ"
                ]
            }
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query2.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/undervalued_large_caps?offset=0&count=100',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635392153'
    },
    desc = 'Large cap stocks that are potentially undervalued.'
)

aggressive_small_caps = Screener_Info(
    url = "https://query2.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "eodvolume",
    "sortType": "desc",
    "quoteType": "equity",
    "query": {
        "operator": "and",
        "operands": [
        {
            "operator": "gt",
            "operands": [
            "epsgrowth.lasttwelvemonths",
            25
            ]
        },
        {
            "operator": "lt",
            "operands": [
            "intradaymarketcap",
            2000000000
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NMS"
                ]
            },
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NYQ"
                ]
            }
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query2.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/aggressive_small_caps?offset=0&count=100',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635392153'
    },
    desc = 'Small cap stocks with earnings growth rates better than 25%.'
)

small_cap_gainers = Screener_Info(
    url = "https://query1.finance.yahoo.com/v1/finance/screener?crumb=O5w6Etohmjf&lang=en-US&region=US&formatted=true&corsDomain=finance.yahoo.com",
    payload = json.dumps({
    "offset": 0,
    "size": 100,
    "sortField": "eodvolume",
    "sortType": "desc",
    "quoteType": "equity",
    "query": {
        "operator": "and",
        "operands": [
        {
            "operator": "gt",
            "operands": [
            "percentchange",
            5
            ]
        },
        {
            "operator": "lt",
            "operands": [
            "intradaymarketcap",
            2000000000
            ]
        },
        {
            "operator": "or",
            "operands": [
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NMS"
                ]
            },
            {
                "operator": "eq",
                "operands": [
                "exchange",
                "NYQ"
                ]
            }
            ]
        }
        ]
    },
    "userId": "",
    "userIdType": "guid"
    }),
    headers = {
    'authority': 'query1.finance.yahoo.com',
    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'content-type': 'application/json',
    'accept': '*/*',
    'origin': 'https://finance.yahoo.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://finance.yahoo.com/screener/predefined/small_cap_gainers?offset=0&count=100',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'APID=UPf5711c33-8a44-11e8-81dd-02b99c18d5d2; B=8csf6tldkbs0a&b=4&d=2_Mlm5VtYFqQGDCIoF7I&s=qn&i=b7WmBmVyHrM9kzJrXQA7; A1=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; A3=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw; GUC=AQEBBAFhREtiGEIhAQTA; A1S=d=AQABBDxbYV4CEKJdiBJ0oU8j2drxYkFvqdAFEgEBBAFLRGEYYg3sbmUB_eMAAAcICvBFW-3mcYYID2-1pgZlch6zPZMya10AOwkBBwoBJg&S=AQAAAvfmPeRL6B7baUgM3_ArVxw&j=WORLD; cmp=t=1635391112&j=0; APIDTS=1635392153'
    },
    desc = 'Small Caps with a 1 day price change of 5.0% or more.'
)

#dict of screeners
screeners = {
    'most_shorted_stocks':most_shorted_stocks,
    'undervalued_growth_stocks':undervalued_growth_stocks,
    'growth_technology_stocks':growth_technology_stocks,
    'day_gainers':day_gainers,
    'day_losers':day_losers,
    'most_actives':most_actives,
    'undervalued_large_caps':undervalued_large_caps,
    'aggressive_small_caps':aggressive_small_caps,
    'small_cap_gainers':small_cap_gainers
}