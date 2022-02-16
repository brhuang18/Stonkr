import faker from 'faker';
import React from 'react';
import PropTypes from 'prop-types';
import { noCase } from 'change-case';
import { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { set, sub, formatDistanceToNow } from 'date-fns';
import { Icon } from '@iconify/react';
import bellFill from '@iconify/icons-eva/bell-fill';
import clockFill from '@iconify/icons-eva/clock-fill';
import doneAllFill from '@iconify/icons-eva/done-all-fill';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { w3cwebsocket as W3CWebSocket } from "websocket";
// material
import { alpha } from '@mui/material/styles';
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  IconButton,
  Typography,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton
} from '@mui/material';
// utils
import { mockImgAvatar } from '../../utils/mockImages';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import axios from 'axios'

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.stock}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        { notification.kind == 'value' ? (
          <>
            &nbsp; {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(notification.value) + "  "}
          </>
        ) : (
          <>
            &nbsp; {Number(notification.value).toFixed(2) + "%"}
          </>
        )}
      </Typography>
    </Typography>
  );

  if (notification.kind === 'value') {
    return {
      avatar: "$",
      title
    };
  }
  if (notification.kind === 'percentage') {
    return {
      avatar: "%",
      title
    };
  }
}

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired
};

function NotificationItem({ notification }) {
  const { avatar, title } = renderContent(notification);
  const navigate = useNavigate()

  return (
    <ListItemButton
      to={`/dashboard/search/${notification.stock}/overview`}
      disableGutters
      component={RouterLink}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected'
        })
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: '#2962ff' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled'
            }}
          >
            <Box component={Icon} icon={clockFill} sx={{ mr: 0.5, width: 16, height: 16 }} />
            {formatDistanceToNow(new Date(notification.time))}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default function NotificationsPopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [newNotifications, setNewNotifications] = useState([])
  const [notifications, setNotifications] = useState([]);
  const totalUnRead = newNotifications.length;
  const webSocket = useRef(null);

  React.useEffect(() => {
    webSocket.current = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${localStorage.getItem("user_id")}/`);
    webSocket.current.onmessage = (message) => {
      axios.get(`http://127.0.0.1:8000/notification?notification_id=${message.data}`, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        setNewNotifications(oldArray => [...oldArray, res.data])
      }).catch(function (err) {
        console.log(err)
      })
    };

    axios.get('http://127.0.0.1:8000/notifications/triggered/', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      const reversed = res.data.slice().reverse()
      setNotifications(reversed)
    }).catch(function (err) {
      console.log(err.response)
    })
    return () => webSocket.current.close();
  }, [])

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNewNotifications([])

    axios.get('http://127.0.0.1:8000/notifications/triggered/', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      const reversed = res.data.slice().reverse()
      setNotifications(reversed)
    }).catch(function (err) {
      console.log(err.response)
    })
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        size="large"
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity)
          })
        }}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Icon icon={bellFill} width={20} height={20} />
        </Badge>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 360 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} new notifications
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Icon icon={doneAllFill} width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                New
              </ListSubheader>
            }
          >
            {newNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Before that
              </ListSubheader>
            }
          >
            {notifications.slice(0, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        </Scrollbar>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple component={RouterLink} to="/dashboard/notifications">
            View All
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
