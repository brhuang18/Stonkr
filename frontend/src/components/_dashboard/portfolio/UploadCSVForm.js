import * as Yup from 'yup';
import { useCallback, useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import {
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  FormControlLabel
} from '@mui/material';
// utils
import { UploadSingleFile } from '.';
import { useParams } from 'react-router';
import axios from 'axios'

// ----------------------------------------------------------------------

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));

// ----------------------------------------------------------------------

export default function UploadCSVForm() {
  const params = useParams()
  const [open, setOpen] = useState(false);

  const handleOpenPreview = () => {
    setOpen(true);
  };

  const handleClosePreview = () => {
    setOpen(false);
  };

  const UploadCSVForm = Yup.object().shape({
    stock: Yup.string().required("Is required!"),
    order_type: Yup.string().required("Is required!"),
    order_price: Yup.string().required("Is required!"),
    brokerage_fee: Yup.string().required("Is required!"),
    trade_date: Yup.string().required("Is required!"),
    quantity: Yup.string().required("Is required!"),
    file: Yup.mixed().required("Is required")
  });

  const formik = useFormik({
    initialValues: {
      stock: "",
      order_type: "",
      order_price: "",
      brokerage_fee: "",
      trade_date: "",
      quantity: "",
      file: null,
    },
    validationSchema: UploadCSVForm,
    onSubmit: () => {
      let formdata = new FormData()
      formdata.append("trades", formik.values.file)
      formdata.append("portfolio_id", params.portfolio_id)
      formdata.append("stock", formik.values.stock)
      formdata.append("order_type", formik.values.order_type)
      formdata.append("order_price", formik.values.order_price)
      formdata.append("brokerage_fee", formik.values.brokerage_fee)
      formdata.append("trade_date", formik.values.trade_date)
      formdata.append("quantity", formik.values.quantity)

      axios.put('http://127.0.0.1:8000/portfolio/upload_csv', formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "200") {
          alert('success')
          formik.setSubmitting(false)
          formik.resetForm()
        }
      }).catch(function (err) {
        const err_status = err.response.status
        console.log(err.response)
        if (err_status == "400") {
          if (err.response.data.length != 0) {
            formik.setFieldError("file", "Invalid File (check tickers)")
          } else {
            formik.setFieldError("stock", "Possible invalid field, please check spelling!")
            formik.setFieldError("order_type", "Possible invalid field, please check spelling!")
            formik.setFieldError("order_price", "Possible invalid field, please check spelling!")
            formik.setFieldError("brokerage_fee", "Possible invalid field, please check spelling!")
            formik.setFieldError("trade_date", "Possible invalid field, please check spelling!")
            formik.setFieldError("quantity", "Possible invalid field, please check spelling!")
            formik.setSubmitting(false)
          }
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFieldValue('cover', {
          ...file,
          preview: URL.createObjectURL(file)
        });
      }
    },
    [setFieldValue]
  );

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <LabelStyle style={{ paddingBottom: '12px' }}>{"Map your field names -> our csv header names"}</LabelStyle>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Stock Header"
              {...getFieldProps('stock')}
              error={Boolean(touched.stock && errors.stock)}
              helperText={touched.stock && errors.stock}
            />

            <TextField
              fullWidth
              label="Order Type Header"
              {...getFieldProps('order_type')}
              error={Boolean(touched.order_type && errors.order_type)}
              helperText={touched.order_type && errors.order_type}
            />

            <TextField
              fullWidth
              label="Order Price Header"
              {...getFieldProps('order_price')}
              error={Boolean(touched.order_price && errors.order_price)}
              helperText={touched.order_price && errors.order_price}
            />

            <TextField
              fullWidth
              label="Brokerage Fee Header"
              {...getFieldProps('brokerage_fee')}
              error={Boolean(touched.brokerage_fee && errors.brokerage_fee)}
              helperText={touched.brokerage_fee && errors.brokerage_fee}
            />

            <TextField
              fullWidth
              label="Trade Date Header"
              {...getFieldProps('trade_date')}
              error={Boolean(touched.trade_date && errors.trade_date)}
              helperText={touched.trade_date && errors.trade_date}
            />

            <TextField
              fullWidth
              label="Quantity Header"
              {...getFieldProps('quantity')}
              error={Boolean(touched.quantity && errors.quantity)}
              helperText={touched.quantity && errors.quantity}
            />

            <div>
              <LabelStyle>File</LabelStyle>
              <input type="file" accept=".csv" id="myFile" name="filename" 
                onChange={(event) => {
                  setFieldValue("file", event.currentTarget.files[0]);
                }}
              />
              {touched.file && errors.file && (
                <FormHelperText error sx={{ px: 2 }}>
                  {touched.file && errors.file}
                </FormHelperText>
              )}
            </div>
            
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Upload
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </>
  );
}
