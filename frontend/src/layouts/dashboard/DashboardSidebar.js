import PropTypes from 'prop-types';
import { useEffect } from 'react';
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack } from '@mui/material';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
import { MHidden } from '../../components/@material-extend';
//
import sidebarConfig from './SidebarConfig';
import account from '../../_mocks_/account';

import { is_loggedin } from 'src/utils/check_auth';
import axios from 'axios'

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH
  }
}));

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: theme.shape.borderRadiusSm,
  backgroundColor: theme.palette.grey[200]
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
  }, [pathname]);

  function RenderProfile () {
    const [user, setUser] = React.useState({
      email: "",
      first_name: "",
      id: "",
      last_name: "",
      privacy: "",
      profile_pic: "",
      username: "",
    })

    React.useEffect(() => {
      axios.get(`http://127.0.0.1:8000/user/view/?user_id=${localStorage.getItem('user_id')}`, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem('user_token')
        }
      }, null).then(function (res) {
        setUser(res.data)
      }).catch(function (err) {
        console.log(err.response)
      })
    }, [])

    if (is_loggedin()) {
      return (
        <Box sx={{ mb: 5, mx: 2.5 }}>
          <Link underline="none" component={RouterLink} to={"/dashboard/profile/me"} >
            <AccountStyle>
              <Avatar src={account.photoURL} alt="photoURL" />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                  {user.first_name + ' ' + user.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.username}
                </Typography>
              </Box>
            </AccountStyle>
          </Link>
        </Box>
      )
    } else {
      return (
        <Box sx={{ mb: 5, mx: 2.5 }}>
          <Link underline="none" component={RouterLink} to="/login">
            <AccountStyle>
              <Avatar src={account.photoURL} alt="photoURL" />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                  Please login/register
                </Typography>
              </Box>
            </AccountStyle>
          </Link>
        </Box>
      );
    }
  }

  const renderContent = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': { height: '100%', display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'inline-flex' }}>
          <Logo />
        </Box>
      </Box>

      <RenderProfile />

      <NavSection navConfig={sidebarConfig} />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <RootStyle>
      <MHidden width="lgUp">
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH }
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>

      <MHidden width="lgDown">
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default'
            }
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>
    </RootStyle>
  );
}
