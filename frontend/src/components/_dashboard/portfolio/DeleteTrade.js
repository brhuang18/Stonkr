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
import { useParams } from 'react-router';

export default function DeleteTrade(props) {
  const [open, setOpen] = React.useState(false);
  const {trade_id, setData, setFilteredData} = props;
  const params = useParams()

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  }

  const handleSubmit = () => {
    let data = {
        trade_id : trade_id
    }
    axios.delete('http://127.0.0.1:8000/trade/delete_trade/', {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }, data
      }).then(function (res) {
        if (res.status == "200") {
          setOpen(false);
          axios.get(`http://127.0.0.1:8000/trade/holdings/get_trades/?portfolio_id=${params.portfolio_id}&stock_ticker=${params.trade_id}`, {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null)
          .then(function (res) {
            setData(res.data.trades)
            setFilteredData(res.data.trades)
          }).catch(function (err) {
            console.log(err.response)
          })
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.error_message;
        console.log(err)
        console.log(err_msg)
        if (err_status == "404") {
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
          {"Delete this Trade?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Click Confirm to delete this trade
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