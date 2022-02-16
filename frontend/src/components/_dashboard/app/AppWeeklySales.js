import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography } from '@mui/material';
// utils
// import { fShortenNumber } from '../../../utils/formatNumber';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  // textAlign: 'center',
  display: 'flex',
  // padding: theme.spacing(1, 1),
  padding: '12px',
  alignItems: 'center',
  color: theme.palette.primary.darker,
  backgroundColor: theme.palette.primary.lighter
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.24
  )} 100%)`
}));

// ----------------------------------------------------------------------

const TOTAL = 714000;

export default function AppWeeklySales() {
  return (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <div>
          <Typography variant="body2" sx={{ opacity: 0.72 }}>
            Today's Balance
          </Typography>
          <Typography variant="h6">$12000</Typography>
        </div>
        <Box
          sx={{
            width: 45,
            height: 45,
            bgcolor: 'primary.main',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AccountBalanceIcon style={{ fill: 'white', marginLeft: '1px' }}/>
        </Box>
      </Box>
    </Card>
  );
}
