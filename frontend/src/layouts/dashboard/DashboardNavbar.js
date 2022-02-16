import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import menu2Fill from '@iconify/icons-eva/menu-2-fill';
import logout_icon from '@iconify/icons-eva/log-out-fill';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material';
// components
import { MHidden } from '../../components/@material-extend';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
import { Logout } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import axios from 'axios'

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`
  }
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5)
  }
}));

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};

export default function DashboardNavbar({ onOpenSidebar }) {
  const navigate = useNavigate();

  function logout () {
    axios.post('http://127.0.0.1:8000/auth/logout/', null, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem('user_token')
      }
    }).then(function (res) {
      if (res.status == "200") {
        localStorage.removeItem("user_token")
        localStorage.removeItem("user_id")
        navigate('/dashboard', { replace: true });
      }
    }).catch(function (err) {
      console.log(err.response)
    })
  }

  return (
    <RootStyle>
      <ToolbarStyle>
        <MHidden width="lgUp">
          <IconButton onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
            <Icon icon={menu2Fill} />
          </IconButton>
        </MHidden>

        <Searchbar />
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>

          { localStorage.getItem("user_id") == null ? (
            <div/>
          ) : (
            <div>
              <NotificationsPopover />
              <Tooltip title="Logout">
                <IconButton aria-label="logout" onClick={logout}>
                  <Icon icon={logout_icon} />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </Stack>
      </ToolbarStyle>
    </RootStyle>
  );
}
