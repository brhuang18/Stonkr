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

export default function DeletePortfolio(props) {
  const [open, setOpen] = React.useState(false);
  const {portfolioID, setData, setFilteredData} = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  }

  const handleSubmit = () => {
    let data = {
        portfolio_id : portfolioID
    }
    axios.delete('http://127.0.0.1:8000/portfolio/', {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }, data
      }).then(function (res) {
        if (res.status == "200") {
          setOpen(false);
          axios.get('http://127.0.0.1:8000/portfolios/overview', {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null).then(function (res) {
            setData(res.data.portfolios)
            setFilteredData(res.data.portfolios)
          }).catch(function (err) {
            console.log(err)
          })
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.error_message;
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
          {"Delete this Portfolio?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Click Confirm to delete this Portfolio
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