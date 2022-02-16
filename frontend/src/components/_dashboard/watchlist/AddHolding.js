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
import add_icon from '@iconify/icons-eva/plus-outline';
import MuiAlert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import * as Yup from 'yup';

import { Menu, MenuItem, ListItemIcon, ListItemText, Stack,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';

import edit_dets from '@iconify/icons-eva/edit-2-fill';
import { useFormik, Form, FormikProvider } from 'formik';
import axios from 'axios';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useNavigate, useParams, useLocation } from 'react-router';
import { replace } from 'lodash-es';

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

export default function AddHolding (props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [valid, setValid] = React.useState(false);
  const { setData, setFilteredData} = props;

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/watchlist/get?watchlist_id=${params.watchlist_id}&user=${localStorage.getItem("user_id")}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      if (res.data.user_id == localStorage.getItem("user_id")) {
        setValid(true)
      }
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  // handle dialog
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    formik.resetForm()
    setOpen(false);
  };

  //handle toast
  const handleClick2 = () => {
    setOpen2(true);
  };

  const handleClose2 = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen2(false);
  };

  // const [showPassword, setShowPassword] = React.useState(false);

  const StockSchema = Yup.object().shape({
    stock_ticker: Yup.string().required('Stock Ticker is required'),
  })

  const formik = useFormik({
    initialValues: {
      stock_ticker: "",
    },
    validationSchema: StockSchema,
    onSubmit: () => {
      let data = {
        user: Number(localStorage.getItem("user_id")),
        watchlist : params.watchlist_id,
        stock : formik.values.stock_ticker
      }
      axios.post('http://127.0.0.1:8000/watchlist/addStock/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "201") {
          handleClick2()
          axios.get(`http://127.0.0.1:8000/watchlist/metrics?watchlist_id=${params.watchlist_id}`, {
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
            formik.setFieldError("stock_ticker", "Invalid Stock Ticker");
          } else if (err_msg == "Enter a stock id that isn't in the watchlist.") {
            formik.setFieldError("stock_ticker", "Stock Ticker Already In Watchlist");
          } else {
            console.log("err_msg");
          }
          
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      {valid ? (
        <div>
          <Tooltip title="Add to Watchlist" onClick={handleClickOpen}>
            <IconButton>
              <Icon icon={add_icon} />
            </IconButton>
          </Tooltip>

          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            fullWidth
          >
            <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
              Add Stock To the Watchlist
            </BootstrapDialogTitle>
            <FormikProvider value={formik}>
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <DialogContent dividers>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Stock Ticker"
                      {...getFieldProps('stock_ticker')}
                      error={Boolean(touched.stock_ticker && errors.stock_ticker)}
                      helperText={touched.stock_ticker && errors.stock_ticker}
                    />
                  </Stack>
                  </Stack>
                  <Snackbar open={open2} autoHideDuration={1500} onClose={handleClose2}>
                    <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                        Added To Watchlist Successfully!
                    </Alert>
                  </Snackbar>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus type="submit">
                    Add
                  </Button>
                </DialogActions>
              </Form>
            </FormikProvider>
          </BootstrapDialog>
        </div>
      ) : (
        <div />
      )}
    </div>

  );
}
