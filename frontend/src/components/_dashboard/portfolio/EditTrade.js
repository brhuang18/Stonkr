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
import { useNavigate, useParams } from 'react-router';
import { replace } from 'lodash-es';
import { Link as RouterLink } from 'react-router-dom';
import editFill from '@iconify/icons-eva/edit-fill';


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

export default function EditTrade (props) {
  const params = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const {trade_id, data, setData, setFilteredData} = props;

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

  function handleData () {
    let res = {
      trade_id: trade_id,
    }
    if (data.portfolio != formik.values.portfolio) {
      res['portfolio'] = formik.values.portfolio
    } 
    if (data.stock != formik.values.stock) {
      res['stock'] = formik.values.stock
    } 
    if (data.trade_date != formik.values.trade_date) {
      res['trade_date'] = formik.values.trade_date
    } 
    if (data.order_price != formik.values.order_price) {
      res['order_price'] = formik.values.order_price
    } 
    if (data.brokerage_fee != formik.values.brokerage_fee) {
      res['brokerage_fee'] = formik.values.brokerage_fee
    } 
    if (data.order_type != formik.values.order_type) {
      res['order_type'] = formik.values.order_type
    } 
    if (data.quantity != formik.values.quantity) {
      res['quantity'] = formik.values.quantity
    } 
    if ("" != formik.values.quantity_left) {
      res['quantity_left'] = formik.values.quantity_left
    } 
    return res
  }

  const EditSchema = Yup.object().shape({
    portfolio: Yup.string().required("Portfolio required!"),
    stock: Yup.string().required("Stock is required!"),
    trade_date: Yup.date().required("Trade Date is required!"),
    order_price: Yup.number().required("Order Price is required!"),
    brokerage_fee: Yup.number().required("Brokerage Fee"),
    order_type: Yup.string().required("Order Type is required"),
    quantity: Yup.number().required("Quantity is required!"),
    quantity_left: Yup.number(),
  });

  const formik = useFormik({
    initialValues: {
      trade_id: trade_id,
      portfolio: data.portfolio_name,
      stock: data.stock,
      trade_date: data.trade_date,
      order_price: data.order_price,
      brokerage_fee: data.brokerage_fee,
      order_type: data.order_type,
      quantity: data.quantity,
      quantity_left: ""
    },
    validationSchema: EditSchema,
    onSubmit: () => {
      const data = handleData()

      axios.put('http://127.0.0.1:8000/trade/edit_trade/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
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
        console.log(err.response)

        if (err_status == "404") {
          if (err.response.data.response == `You don't have a portfolio with this name`) {
            formik.setFieldError('portfolio', `You don't have a portfolio with this name`)
          }
        } else if (err_status == "403") {
          formik.setFieldError("portfolio", err_msg)
        } else if (err_status == "400") {
          formik.setFieldError("quantity", err_msg)
        }

        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      <Tooltip title="Edit Trade" onClick={handleClickOpen}>
        <MenuItem component={RouterLink} to="#" sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Tooltip>

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Edit a Trade
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

                <TextField
                  fullWidth
                  label="Portfolio name"
                  {...getFieldProps('portfolio')}
                  error={Boolean(touched.portfolio && errors.portfolio)}
                  helperText={touched.portfolio && errors.portfolio}
                />

                <TextField
                  fullWidth
                  label="Stock Ticker"
                  {...getFieldProps('stock')}
                  error={Boolean(touched.stock && errors.stock)}
                  helperText={touched.stock && errors.stock}
                />

                <TextField
                  label="Trade Date"
                  type="date"
                  inputFormat="yyyy/MM/dd"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...getFieldProps('trade_date')}
                  value={values.trade_date}
                  onChange={formik.handleChange}
                  error={Boolean(touched.trade_date && errors.trade_date)}
                  helperText={touched.trade_date && errors.trade_date}
                />

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
                  type="number"
                  label="Quantity Left"
                  {...getFieldProps('quantity_left')}
                  error={Boolean(touched.quantity_left && errors.quantity_left)}
                  helperText={touched.quantity_left && errors.quantity_left}
                />
            </Stack>
            <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
              <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                Trade Edited Successfully!
              </Alert>
            </Snackbar>
            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit">
                Edit Trade
              </Button>
            </DialogActions>
          </Form>
        </FormikProvider>
      </BootstrapDialog>
    </div>
  );
}
