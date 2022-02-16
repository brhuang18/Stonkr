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

// ----------------------------------------------------------------------

export default function StockHisData(props) {
  const { data } = props
  const nonAdj = ['0. Date', '1. Open', '2. High', '3. Low', '4. Close', '5. Volume']
  const adj = ['0. Date', '1. Open', '2. High', '3. Low', '4. Close', '5. Volume', '6. Adjusted Close']

  function SummaryTable () {
    let keys = []
    const history = data.history
    if (data.adj == true) {
      keys = adj
    } else {
      keys = nonAdj
    }

    return (
      <Table style={{ width: '100%', overflow: 'scroll' }} aria-label="historical data" >
        <TableHead>
          <TableRow>
            {keys.map((data, index) => {
              return (
                <TableCell key={index} align="right">{data.slice(3)}</TableCell>
              )
            })}
          </TableRow>
        </TableHead>
          <TableBody>
            {history.map((row, index) => {
              return(
                <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {keys.map((column, index2) => {
                    if (column == '1. Open' || column == '2. High' || column == '3. Low' || column == '4. Close') {
                      return (
                        <TableCell index={index2} align="right">
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(row[column.toLowerCase()])}
                        </TableCell>
                      )
                    } else {
                      return (
                        <TableCell index={index2} align="right">{row[column.toLowerCase()]}</TableCell>
                      )
                    }
                  })}
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    );
  }

  return (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <div style={{ width: '100%' }}>
          <Typography variant="h6">Historial Data</Typography>
          <SummaryTable />
        </div>
      </Box>
    </Card>
  );
}
