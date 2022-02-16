import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// utils
// import { fShortenNumber } from '../../../utils/formatNumber';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { fShortenNumber } from '../../../utils/formatNumber';

import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router';
import StockHisData from './StockHisData';
import { StockHisForm } from '.';
import LoadingScreen from '../../../components/LoadingScreen';

// ----------------------------------------------------------------------

export default function StockHisSetting() {
  const params = useParams()
  const [data, setData] = React.useState({
    adj: false,
    history: [],
  })
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  React.useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])

  React.useEffect(() => {
    let end = new Date()
    end = end.toISOString().split('T')[0]

    let start = new Date();
    start.setMonth(start.getMonth() - 3);
    start = start.toISOString().split('T')[0]
    const url = `http://127.0.0.1:8000/search/histdata/?stock_ticker=${params.ticker}&request_type=daily&start_date=${start}&end_date=${end}&adj=false`
    axios.get(url, null, null)
    .then(function (res) {
      if (res.status == '200') {
        setData({
          adj: false,
          history: res.data['Historical Data']
        })
        setIsLoading(false);
      }
    }).catch(function (err) {
      console.log(err.response)
    })
  }, [params])

  return !isLoading ?  (
    <div>
      <Card sx={{ mb: "12px" }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
          <div style={{ width: '100%' }}>
            <StockHisForm setData={setData} />
          </div>
        </Box>
      </Card>

      <StockHisData data={data} />
    </div>
  ) : (<LoadingScreen></LoadingScreen>);
}
