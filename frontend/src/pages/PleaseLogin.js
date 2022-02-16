import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, Container } from '@mui/material';
// components
import { MotionContainer, varBounceIn } from '../components/animate';
import Page from '../components/Page';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

// ----------------------------------------------------------------------

export default function PleaseLogin() {
  return (
    <RootStyle title="Please Login | Minimal-UI">
      <Container>
        <MotionContainer initial="initial" open>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <motion.div variants={varBounceIn}>
              <Typography variant="h3" paragraph>
                Sorry, please login!
              </Typography>
            </motion.div>
            <Typography sx={{ color: 'text.secondary', mb: '24px' }}>
              Sorry, in order to access this page and it's features please login or 
              register an account.
            </Typography>

            <Button to="/login" size="large" variant="contained" component={RouterLink}>
              Login
            </Button>
          </Box>
        </MotionContainer>
      </Container>
    </RootStyle>
  );
}
