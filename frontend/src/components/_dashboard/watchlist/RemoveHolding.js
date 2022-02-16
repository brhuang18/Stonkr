import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import { Icon } from '@iconify/react';
import axios from 'axios';

export default function RemoveHolding(props) {
  const [open, setOpen] = React.useState(false);
  const {watchlistID, stockTicker, setData, setFilteredData} = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  }

  const handleSubmit = () => {
    let data = {
        user: Number(localStorage.getItem("user_id")),
        watchlist : watchlistID,
        stock_ticker: stockTicker
    }
    axios.delete('http://127.0.0.1:8000/watchlist/removeStock/', {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }, data
      }).then(function (res) {
        if (res.status == "200") {
          setOpen(false);
          axios.get(`http://127.0.0.1:8000/watchlist/metrics?watchlist_id=${watchlistID}`, {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null).then(function (res) {
            setData(res.data.metrics)
            setFilteredData(res.data.metrics)
          }).catch(function (err) {
            console.log(err)
            let err_status = err.response.status;
            let err_msg = err.response.data.response;
            console.log(err)
            console.log(err_msg)
            if (err_status == "400") {
              console.log(err_msg)
            } else if (err.status == "403") {
              console.log(err_msg)
            }
          })
          setTimeout(function(){ handleClose() }, 1500);
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.response;
        console.log(err)
        console.log(err_msg)
        if (err_status == "403") {
          console.log(err_msg)
        }
        setOpen(false);
      })
    }

  return (
    <div>
      <MenuItem sx={{ color: 'text.secondary' }} onClick={handleClickOpen}>
          <ListItemIcon>
            <Icon icon={trash2Outline} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Remove" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Remove this Stock?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Click Confirm to remove this Stock
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Go Back</Button>
          <Button onClick={handleSubmit} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}