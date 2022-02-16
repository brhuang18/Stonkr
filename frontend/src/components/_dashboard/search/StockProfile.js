import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
// utils
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router';
import { fShortenNumber } from '../../../utils/formatNumber';
import LoadingScreen from '../../../components/LoadingScreen';

// ----------------------------------------------------------------------

export default function StockProfile() {
  const params = useParams()
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  React.useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])

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

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/search/summary/?stock_ticker=${params.ticker}`, null, null)
    .then(function (res) {
      setData(res.data)
      setIsLoading(false);
    }).catch(function (err) {
      console.log(err.response)
    })
  }, [params])

  function Info (props) {
    const { title, body } = props;
    return (
      <div>
        <Typography variant="h6" sx={{ opacity: 0.72 }}>
          {title}
        </Typography>
        <Typography variant="body" sx={{ opacity: 0.72 }}>
          {body}
        </Typography>
        <Divider sx={{ mt: "12px", mb: "12px" }} />
      </div>
    )
  }

  return !isLoading ? (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <div>
          <Info title="Company Summary" body={data.Information.Description}/>
          <Info title="Asset Type" body={data.Information.AssetType}/>
          <Info title="Country" body={data.Information.Country}/>
          <Info title="Currency" body={data.Information.Currency}/>
          <Info title="Exchange" body={data.Information.Exchange}/>
          <Info title="Industry" body={data.Information.Industry}/>
          <Info title="Sector" body={data.Information.Sector}/>
        </div>
      </Box>
    </Card>
  ) : (<LoadingScreen></LoadingScreen>);
}
