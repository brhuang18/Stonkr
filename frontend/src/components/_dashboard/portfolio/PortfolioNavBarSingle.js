// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography, Stack, Button } from '@mui/material';

import axios from 'axios'
import React from 'react'
import { useLocation, useNavigate, NavLink as RouterLink } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function PortfolioNavBarSingle(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.split("/").at(-2)
  const tabs = [['Portfolio Value', 'singleValue'], ['Portfolio Profit', 'singleProfit']]

  function returnPath (path) {
    let cur_address = location.pathname.split("/")
    cur_address[4] = path
    return cur_address.join("/")
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
