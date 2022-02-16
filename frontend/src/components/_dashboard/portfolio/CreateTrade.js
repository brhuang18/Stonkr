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

export default function CreateTrade (props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const {setData, setFilteredData} = props

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

  const TradeSchema = Yup.object().shape({
    order_type: Yup.string().required('Order type is required'),
    quantity: Yup.number().required('Quantity is required'),
    stock: Yup.string().required('Portfolio name required'),
    order_price: Yup.number().required('Order price is required'),
    trade_date: Yup.date().required('Purchase date is required'),
    brokerage_fee: Yup.number().required('Bokerage fee is required'),
  });

  const formik = useFormik({
    initialValues: {
        portfolio: params.portfolio_id,
        stock: "",
        trade_date: "",
        order_price: "",
        brokerage_fee: "",
        order_type: "B",
        quantity: "",
    },
    validationSchema: TradeSchema,
    onSubmit: () => {
      const now = new Date()
      const our_date = new Date(formik.values.trade_date)
      if (our_date > now) {
        formik.setFieldError('trade_date', 'Invalid Date')
        formik.setSubmitting(false)
        return
      } else if (formik.values.quantity < 0) {
        formik.setFieldError('quantity', 'Invalid Quantity')
        formik.setSubmitting(false)
        return
      }

      axios.post('http://127.0.0.1:8000/trade/add_trade/', formik.values, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "201") {
          handleClick2()
          if (location.pathname.split("/").at(-2) == "singleValue" || location.pathname.split("/").at(-2) == "singleProfit") {
            axios.get(`http://127.0.0.1:8000/portfolio/holdings?portfolio_id=${params.portfolio_id}`, {
              headers: {
                Authorization: 'Token ' + localStorage.getItem("user_token")
              }
            }, null).then(function (res) {
              setData(res.data)
              setFilteredData(res.data)
            }).catch(function (err) {
              console.log(err)
            })
          } else {
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
         
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        console.log(err.response)
        if (err_status == "403") {
          console.log(err.response)
        }

        if (err_status == "400" && err.response.data.response == "Invalid Trade. Your the total of your sell orders exceeds the total of your buy orders") {
          formik.setFieldError("stock", "Invalid Sell Order")
          formik.setFieldError("order_date", "Invalid Sell Order")
          formik.setFieldError("quantity", "Invalid Sell Order")
        } else if (err_status == "400") {
          formik.setFieldError("quantity", "Possible Invalid Quantity")
          formik.setFieldError("stock", "Possible Invalid Stock Ticker")
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      <Tooltip title="Add Trade" onClick={handleClickOpen}>
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
          Add Trade
        </BootstrapDialogTitle>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Stack spacing={3}>
                <Button variant="contained" color={formik.values.order_type == "B" ? "success" : "error"} onClick={() => {
                  if (formik.values.order_type == "B") {
                    formik.setFieldValue("order_type", "S")
                  } else {
                    formik.setFieldValue("order_type", "B")
                  }
                }}>{formik.values.order_type == "B" ? "Buy" : "Sell"}</Button>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    {...getFieldProps('quantity')}
                    error={Boolean(touched.quantity && errors.quantity)}
                    helperText={touched.quantity && errors.quantity}
                  />

                  <TextField
                    fullWidth
                    label="Stock Ticker"
                    {...getFieldProps('stock')}
                    error={Boolean(touched.stock && errors.stock)}
                    helperText={touched.stock && errors.stock}
                  />

                  <TextField
                    label="Order Date"
                    type="date"
                    inputFormat="yyyy/MM/dd"
                    sx={{ width: 600 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...getFieldProps('trade_date')}
                    value={values.trade_date}
                    onChange={formik.handleChange}
                    error={Boolean(touched.trade_date && errors.trade_date)}
                    helperText={touched.trade_date && errors.trade_date}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    {...getFieldProps('order_price')}
                    error={Boolean(touched.order_price && errors.order_price)}
                    helperText={touched.order_price && errors.order_price}
                  />

                  <TextField
                    fullWidth
                    label="Brokerage Fee"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    {...getFieldProps('brokerage_fee')}
                    error={Boolean(touched.brokerage_fee && errors.brokerage_fee)}
                    helperText={touched.brokerage_fee && errors.brokerage_fee}
                  />
                </Stack>
              </Stack>
              <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
                <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                    Trade Created Successfully!
                </Alert>
              </Snackbar>
            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit">
                Add Trade
              </Button>
            </DialogActions>
          </Form>
        </FormikProvider>
      </BootstrapDialog>
    </div>
  );
}
