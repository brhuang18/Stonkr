import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Card, Stack, Link, Container, Typography, IconButton, Tooltip } from '@mui/material';
// layouts
import AuthLayout from '../layouts/AuthLayout';
// components
import Page from '../components/Page';
import { MHidden } from '../components/@material-extend';
import { LoginForm } from '../components/authentication/login';
import SendResetCodeForm from 'src/components/authentication/resetPassword/SendResetCodeForm';
import AuthSocial from '../components/authentication/AuthSocial';

import { Icon } from '@iconify/react';
import arrowBack from '@iconify/icons-eva/arrow-back-fill';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));


// ----------------------------------------------------------------------

export default function SendResetCode() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/login', {replace: true })
  }

  return (
    <RootStyle title="Reset Password | Stonkr">
      <AuthLayout>
        Don’t have an account? &nbsp;
        <Link underline="none" variant="subtitle2" component={RouterLink} to="/register">
          Get started
        </Link>
      </AuthLayout>

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Hi, Welcome Back
          </Typography>
          <img src="/static/illustrations/illustration_login.png" alt="login" />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <div>
            <Tooltip title="Go back" placement="right">
              <IconButton style={{ marginLeft: '-8px' }} onClick={handleBack}>
                <Icon icon={arrowBack} />
              </IconButton>
            </Tooltip>
          </div>
          <Stack sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom>
              Reset your password
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Enter your Email below.</Typography>
          </Stack>

          <SendResetCodeForm />

          <MHidden width="smUp">
            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Don’t have an account?&nbsp;
              <Link variant="subtitle2" component={RouterLink} to="register">
                Get started
              </Link>
            </Typography>
          </MHidden>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
