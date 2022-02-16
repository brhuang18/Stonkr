import React from 'react';
import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import { sentenceCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
import shareFill from '@iconify/icons-eva/share-fill';
import printerFill from '@iconify/icons-eva/printer-fill';
import archiveFill from '@iconify/icons-eva/archive-fill';
import downloadFill from '@iconify/icons-eva/download-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { useTheme } from '@mui/material/styles';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import {
  Box,
  Menu,
  Card,
  Table,
  Button,
  Divider,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardHeader,
  TableContainer,
  IconButton
} from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';
//
import Label from '../../Label';
import Scrollbar from '../../Scrollbar';
import axios from 'axios'

// ----------------------------------------------------------------------

function MoreMenuButton(props) {
  const { id, setData } = props;
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handleDelete() {
    let data = {
      notification_id: id
    }

    axios.delete('http://127.0.0.1:8000/notification', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }, data
    }).then(function (res) {
      if (res.status == "200") {
        axios.get('http://127.0.0.1:8000/notifications/active/', {
          headers: {
            Authorization: 'Token ' + localStorage.getItem("user_token")
          }
        }, null).then(function (res) {
          setData(res.data)
        }).catch(function (err) {
          console.log(err.response)
        })
      }
    }).catch(function (err) {
      console.log(err.response)
    })
  }

  function handleEdit() {
    let data = {
      notification_id: id,

    }

    axios.put('http://127.0.0.1:8000/notification/', data, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    })
  }

  return (
    <>
      <>
        <IconButton ref={menuRef} size="large" onClick={handleOpen}>
          <Icon icon={moreVerticalFill} width={20} height={20} />
        </IconButton>
      </>

      <Menu
        open={open}
        anchorEl={menuRef.current}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ color: 'error.main' }} onClick={handleDelete}>
          <Icon icon={trash2Outline} width={20} height={20} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

export default function NotificationManageList(props) {
  const theme = useTheme();
  const { data, setData } = props

  React.useEffect(() => {
    axios.get('http://127.0.0.1:8000/notifications/active/', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setData(res.data)
    }).catch(function (err) {
      console.log(err.response)
    })
  }, [])

  function handleColor (value) {
    if (value == 'value') {
      return ("success")
    } else {
      return ("primary")
    }
  }

  return (
    <Card sx={{ pb: '24px' }}>
      <CardHeader title="Notifications" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer sx={{ px: '12px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Interval</TableCell>
                <TableCell>Value</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.stock}</TableCell>
                  <TableCell align="left">
                    <Label
                      variant="ghost"
                      color={handleColor(row.kind)}
                    >
                      {row.kind == "value" ? "Value" : "Percentage"}
                    </Label>
                  </TableCell>
                  <TableCell>{row.interval}</TableCell>
                  <TableCell>
                    {row.kind == "value" ? (
                      <>
                        {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(row.value) + "  "}
                      </>
                    ) : ( 
                      <>
                        {Number(row.value).toFixed(2) + "%"}
                      </>
                    ) }
                  </TableCell>
                  <TableCell align="left">
                    <MoreMenuButton id={row.id} setData={setData} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}
