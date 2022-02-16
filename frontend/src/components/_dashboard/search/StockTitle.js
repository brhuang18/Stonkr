import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography } from '@mui/material';
// utils
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router';
import { fShortenNumber } from '../../../utils/formatNumber';
import { AddHoldingFromSearch } from '../watchlist';
// ----------------------------------------------------------------------

export default function StockTitle() {
  const params = useParams()
  const [data, setData] = React.useState({
    Information: {
      AssetType: "",
      Country: "",
      Currency: "",
      Description: "",
      Exchange: "",
      Industry: "",
      Name: "",
      Sector: "",
      Symbol: "",
    },
    Metrics: {
      Beta: "",
      Close: "",
      DividendYield: "",
      EPS: "",
      ExDividendDate: "",
      MarketCapitalization: "",
      Open: "",
      PERatio: "",
      Range: "",
      Volume: "",
    },
    Response: ""
  })
  const [popularity, setPopularity] = React.useState([]);

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/search/summary/?stock_ticker=${params.ticker}`, null, null)
    .then(function (res) {
      setData(res.data)
    }).catch(function (err) {
      console.log("title erorrs", err.response)
    })
  }, [params])

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/popularity/stock?stock=${params.ticker}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setPopularity(res.data.users);
    }).catch(function (err) {
      console.log("Stock Popularity Error")
      console.log(err.response)
    })
  }, [params])

  return (
    <Card>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
          <div>
            <Typography variant="h6">{data.Information.Name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.72 }}>
              {data.Information.Symbol}:{data.Information.Exchange}
            </Typography>
            <Typography variant="h4">
              {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(data.Metrics.Close) + "  "}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.72 }}>
              Currency in {data.Information.Currency}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.72 }}>
              {popularity} users own this stock
            </Typography>
          </div>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <AddHoldingFromSearch stockTicker = {params.ticker}/>
        </Box>
      </Box>
    </Card>
  );
}
