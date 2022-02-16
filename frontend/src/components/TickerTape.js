// material
import { Grid, Container, Stack, Typography } from '@mui/material';
// components
import Page from './Page';
import { FinanceHomeNewsCard } from 'src/components/_dashboard/financehome';
import LoadingScreen from './LoadingScreen';
//
import axios from 'axios'
import React from 'react'
import {Helmet} from "react-helmet";

export default  class TickerTape extends React.PureComponent {
  constructor(props) {
      super(props);
      this._ref = React.createRef();
  }
componentDidMount() {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
      script.async = true;
      script.innerHTML = JSON.stringify({"symbols": [
        {
          "description": "AUD/USD",
          "proName": "FX:AUDUSD"
        },
        {
          "description": "XAUUSD",
          "proName": "OANDA:XAUUSD"
        },
        {
          "description": "XAGUSD",
          "proName": "OANDA:XAGUSD"
        },
        {
          "description": "SPDR S&P 500",
          "proName": "AMEX:SPY"
        },
        {
          "description": "US100",
          "proName": "CURRENCYCOM:US100"
        },
        {
          "description": "WTI CRUDE OIL",
          "proName": "TVC:USOIL"
        },
        {
          "description": "BTC/USD",
          "proName": "COINBASE:BTCUSD"
        },
        {
          "description": "QQQ",
          "proName": "NASDAQ:QQQ"
        }
      ],
      "showSymbolLogo": true,
      "colorTheme": "light",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "en"})
      this._ref.current.appendChild(script);
  }
  render() {
      return(
      <div class="tradingview-widget-container" ref={this._ref}>
          <div class="tradingview-widget-container__widget"></div>
         
      </div>
      );
  }
 
}