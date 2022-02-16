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

export default function ProfileAbout(props) {
  const { user, setUset } = props

  return (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: 'column' }} dir="ltr">
        <Typography variant="h6">
          {user.first_name + " " + user.last_name}
        </Typography>
        <Typography variant="body">
          {user.username}
        </Typography>
        <Typography variant="body">
          {user.email}
        </Typography>
      </Box>
    </Card>
  );
}
