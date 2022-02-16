import { Icon } from '@iconify/react';
import moneyIcon from '@iconify/icons-ic/baseline-account-balance'; 
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography, Box } from '@mui/material';
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(5, 0),
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

const TOTAL = 234000;

export default function TodaysBalance(props) {
  const { balance } = props;

  return (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <div>
          <Typography variant="body2" sx={{ opacity: 0.72 }}>
            Today's Balance
          </Typography>
          <Typography variant="h6">{fCurrency(balance)}</Typography>
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
          <Icon icon={moneyIcon} width={24} height={24} color='white' />
        </Box>
      </Box>
    </Card>
  );
}
