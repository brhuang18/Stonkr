import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography, Stack, Button } from '@mui/material';
// utils
// import { fShortenNumber } from '../../../utils/formatNumber';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import axios from 'axios'
import React from 'react'
import { useLocation, useNavigate, NavLink as RouterLink } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function StockNavBar(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.split("/").at(-1)
  const tabs = [['overview', 'overview'], ['historical data', 'hisdata'], ['profile', 'profile'],
  ['statistics', 'statistics']]

  function returnPath (path) {
    let curr_address = location.pathname.split("/")

    curr_address[4] = path
    const newpath = curr_address.join("/")

    return newpath 
  }

  return (
    <Card sx={{ mb: "12px" }}>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={0}
        >
          {tabs.map((tab) => {
            if (tab[1] == current) {
              return (
                <Button disabled variant="text">{tab[0]}</Button>
              )
            } else {
              return (
                <Button to={returnPath(tab[1])} component={RouterLink} variant="text">{tab[0]}</Button>
              )
            }
          })}
        </Stack>
      </Box>
    </Card>
  );
}
