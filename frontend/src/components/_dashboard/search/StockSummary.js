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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router';

// ----------------------------------------------------------------------

export default function StockSummary() {
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

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/search/summary/?stock_ticker=${params.ticker}`, null, null)
    .then(function (res) {
      setData(res.data)
    }).catch(function (err) {
      console.log(err.response)
    })
  }, [params])

  function createData(name, data) {
    return { name, data };
  }

  function SummaryTable () {
    const rows = [
      createData('Open', data.Metrics.Open),
      createData('Close', data.Metrics.Close),
      createData('Range', data.Metrics.Range),
      createData('Volume', data.Metrics.Volume),
      createData('Beta', data.Metrics.Beta),
      createData('Dividend Yield', data.Metrics.DividendYield),
      createData('EPS', data.Metrics.EPS),
      createData('Ex Dividend Date', data.Metrics.ExDividendDate),
      createData('Market Capitalizaion', data.Metrics.MarketCapitalization),
      createData('PE Ratio', data.Metrics.PERatio),
    ];
    return (
        <Table style={{ width: '100%' }} aria-label="simple table">
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.data}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
  }

  return (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <div style={{ width: '100%' }}>
          <Typography variant="h6">Summary</Typography>
          <SummaryTable />
        </div>
      </Box>
    </Card>
  );
}
