import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';
import star_icon from '@iconify/icons-ant-design/star-twotone';
import MuiAlert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';

import { Menu, MenuItem, ListItemIcon, ListItemText, Stack,
  TextField,
  Autocomplete,
  Grid
} from '@mui/material';

import axios from 'axios';
import { useState, useEffect } from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AddHoldingFromSearch (props) {
  const { stockTicker } = props;
  const [open, setOpen] = React.useState(false);
  const [dataId, setId] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [render, setRender] = React.useState(false)
  const [data, setData] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("user_id") != undefined) {
      setRender(true)
    }

    axios.get(`http://127.0.0.1:8000/watchlist/getAll?user=${Number(localStorage.getItem("user_id"))}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setData(res.data.watchlists)
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  // handle dialog
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setId(null);
    setErr("");
  };

  const handleButtonClose = () => {
    if (dataId == null) {
      console.log("dataId is NULL");
    } else {
      let postData = {
        user: Number(localStorage.getItem("user_id")),
        watchlist : dataId,
        stock : stockTicker
      }
      axios.post('http://127.0.0.1:8000/watchlist/addStock/', postData, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "201") {
          setOpen(false);
          setId(null);
          setErr("")
        }      
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.response;
        console.log(err.response)
        console.log(err_msg)
        if (err_status == "403") {
          console.log(err_msg)
        }
        else if (err_status == "400") {
          if ( err_msg == "Enter a valid stock id.") {
            console.log(err_msg);
          } else if (err_msg == "Enter a stock id that isn't in the watchlist.") {
            setErr("Stock already exists in this watchlist")
            console.log(err_msg);
          } else {
            console.log("err_msg");
          }
        }
      })
      
    }
  }

  return (
    <div>
      { render ? (
        <div>
          <Tooltip title="Add to Watchlist" onClick={handleClickOpen}>
            <Button variant="outlined" startIcon={<Icon icon={star_icon} />}>
              Add to Watchlist
            </Button>
          </Tooltip>
    
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            fullWidth
          >
            <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
              Choose Watchlist To Add Stock To
            </BootstrapDialogTitle>
            <DialogContent dividers>
              <Grid item xs={12} md={12} lg={12}>
                <Autocomplete
                  fullWidth
                  options={data}
                  getOptionLabel={(option) => option.watchlist_name}
                  renderInput={(params) => <TextField {...params} label="Watchlist" margin="none" />}
                  onChange={(event, newValue) => {
                    if (newValue != null) {
                      setId(newValue["id"]);
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                  }}
                />
                <Typography variant="subtitle1" color="red" sx={{ mt: '5px', ml: '1px' }}>
                  {err}
                </Typography>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit" onClick={handleButtonClose}>
                Add
              </Button>
            </DialogActions>
          </BootstrapDialog>
        </div>

      ): (
        <div></div>
      ) }
    </div>
  );
}
