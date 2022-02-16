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

export default function DeleteWatchlist(props) {
  const [open, setOpen] = React.useState(false);
  const {watchlistID, setData, setFilteredData} = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  }

  const handleSubmit = () => {
    let data = {
        user: Number(localStorage.getItem("user_id")),
        watchlist_id : watchlistID
    }
    axios.delete('http://127.0.0.1:8000/watchlist/delete/', {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }, data
      }).then(function (res) {
        if (res.status == "200") {
          setOpen(false);
          axios.get(`http://127.0.0.1:8000/watchlist/getAll?user=${Number(localStorage.getItem("user_id"))}`, {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null).then(function (res) {
            setData(res.data.watchlists)
            setFilteredData(res.data.watchlists)
          }).catch(function (err) {
            console.log(err)
          })
          // setTimeout(handleClose(), 50000)
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
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete this Watchlist?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Click Confirm to delete this Watchlist
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