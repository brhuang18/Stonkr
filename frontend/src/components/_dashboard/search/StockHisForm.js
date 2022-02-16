import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// material
import {
  Link,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios'
import { FormatItalic } from '@mui/icons-material';

// ----------------------------------------------------------------------

export default function StockHisForm(props) {
  const { setData } = props;
  const params = useParams();
  // const [isSubmitting, setIsSubmitting] = React.useState(false)

  const requestSchema = Yup.object().shape({
    request_type: Yup.string().required('Request type is required'),
    start_date: Yup.date().required('Start date is required'),
    end_date: Yup.date().required('End date is required'),
    adj: Yup.boolean().required('Required')
  });

  const formik = useFormik({
    initialValues: {
      request_type: "",
      start_date: "",
      end_date: "",
      adj: false,
    },
    validationSchema: requestSchema,
    onSubmit: () => {
      formik.setSubmitting(true)
      const url = `http://127.0.0.1:8000/search/histdata/?stock_ticker=${params.ticker}&request_type=${formik.values.request_type}&start_date=${formik.values.start_date}&end_date=${formik.values.end_date}&adj=${formik.values.adj}`
      axios.get(url, null, null)
      .then(function (res) {
        if (res.status == '200') {
          setData({
            adj: formik.values.adj,
            history: res.data['Historical Data']
          })
          formik.setSubmitting(false)
        }
      }).catch(function (err) {
        const err_status = err.response.status
        const err_msg = err.response.data.Response
        if (err_status == "400") {
          console.log(err_msg)
          formik.setFieldError("start_date", err_msg)
          formik.setFieldError("end_date", err_msg)
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" sx={{ my: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label" fullWidth>Request Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              {...getFieldProps('request_type')}
              value={values.request_type}
              label="Age"
              onChange={formik.handleChange}
              error={Boolean(touched.request_type && errors.request_type)}
              helperText={touched.request_type && errors.request_type}
            >
              <MenuItem value={"Daily"}>Daily</MenuItem>
              <MenuItem value={"Weekly"}>Weekly</MenuItem>
              <MenuItem value={"Monthly"}>Monthly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            // defaultValue="2017-05-24"
            inputFormat="yyyy/MM/dd"
            sx={{ width: 800 }}
            InputLabelProps={{
              shrink: true,
            }}
            {...getFieldProps('start_date')}
            value={values.start_date}
            onChange={formik.handleChange}
            error={Boolean(touched.start_date && errors.start_date)}
            helperText={touched.start_date && errors.start_date}
          />

          <TextField
            label="End Date"
            type="date"
            // defaultValue="2017-05-24"
            inputFormat="yyyy/MM/dd"
            sx={{ width: 800 }}
            InputLabelProps={{
              shrink: true,
            }}
            {...getFieldProps('end_date')}
            value={values.end_date}
            onChange={formik.handleChange}
            error={Boolean(touched.end_date && errors.end_date)}
            helperText={touched.end_date && errors.end_date}
          />

          <FormControlLabel
            control={<Checkbox {...getFieldProps('adj')} checked={values.adj} />}
            label="Adjusted?"
          />
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Apply Changes
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
