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
  TableContainer
} from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// import mockData from '../../../utils/mock-data';
//
import Label from '../../Label';
import Scrollbar from '../../Scrollbar';
import React from 'react';
import axios from 'axios';

// ----------------------------------------------------------------------

function MoreMenuButton() {
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
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
        <MenuItem>
          <Icon icon={downloadFill} width={20} height={20} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Download
          </Typography>
        </MenuItem>
        <MenuItem>
          <Icon icon={printerFill} width={20} height={20} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Print
          </Typography>
        </MenuItem>
        <MenuItem>
          <Icon icon={shareFill} width={20} height={20} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Share
          </Typography>
        </MenuItem>
        <MenuItem>
          <Icon icon={archiveFill} width={20} height={20} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Archive
          </Typography>
        </MenuItem>

        <Divider />
        <MenuItem sx={{ color: 'error.main' }}>
          <Icon icon={trash2Outline} width={20} height={20} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

export default function NotificationHistory() {
  const theme = useTheme();
  const [data, setData] = React.useState([])

  React.useEffect(() => {
    axios.get('http://127.0.0.1:8000/notifications/triggered/', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      console.log(res.data)
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

  function handleTime (value) {
    const t = new Date(value)
    return t.toLocaleString()
  }

  return (
    <Card sx={{ pb: '24px' }}>
      <CardHeader title="Notification History" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer sx={{ px: '12px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>id</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Kind</TableCell>
                <TableCell>Interval</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Current Price</TableCell>
                <TableCell>Time</TableCell>
                <TableCell />
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
                  <TableCell>
                    {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(row.current_price) + "  "}
                  </TableCell>
                  <TableCell>
                    {handleTime(row.time)}
                  </TableCell>
                  <TableCell align="right">
                    <MoreMenuButton />
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
