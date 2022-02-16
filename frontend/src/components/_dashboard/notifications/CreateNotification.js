import * as Yup from 'yup';
// import { useSnackbar } from 'notistack';
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
  FormControlLabel,
  CardHeader,
  Box,
  InputLabel,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
// utils
import { UploadSingleFile } from '.';
import { useParams } from 'react-router';
import axios from 'axios'
//

// ----------------------------------------------------------------------

const TAGS_OPTION = [
  'Toy Story 3',
  'Logan',
  'Full Metal Jacket',
  'Dangal',
  'The Sting',
  '2001: A Space Odyssey',
  "Singin' in the Rain",
  'Toy Story',
  'Bicycle Thieves',
  'The Kid',
  'Inglourious Basterds',
  'Snatch',
  '3 Idiots'
];

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));

// ----------------------------------------------------------------------

export default function CreateNotification(props) {
  const { data, setData } = props
  const params = useParams()
  const [open, setOpen] = useState(false);

  function handleChange(event) {
    formik.setFieldValue("type", event.target.value)
  }

  const UploadCSVForm = Yup.object().shape({
    stock: Yup.string().required("Is required!"),
    notification_type: Yup.string().required("Is required!"),
    value: Yup.string().required("Is required!"),
    type: Yup.string()
  });

  const formik = useFormik({
    initialValues: {
      stock: "",
      notification_type: "percentage",
      value: "",
      type: "daily",
    },
    validationSchema: UploadCSVForm,
    onSubmit: () => {
      let data = {}
      data["kind"] = formik.values.notification_type
      data["stock"] = formik.values.stock
      data["value"] = formik.values.value
      
      if (formik.values.notification_type == "percentage") {
        data["interval"] = formik.values.type
      } 

      axios.post('http://127.0.0.1:8000/notification/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "201") {
          axios.get('http://127.0.0.1:8000/notifications/active', {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null).then(function (res) {
            setData(res.data)
          }).catch(function (err) {
            console.log(err.response)
          })
          formik.resetForm()
        }
      }).catch(function (err) {
        console.log(err.response)
      }) 
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  return (
    <Card sx={{ mb: '24px' }}>
      <CardHeader title={`Create Notification`} />
      <Box sx={{ p: 3 }} dir="ltr">
        <FormikProvider value={formik}>
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pb: '12px' }}>
              <Button fullWidth sx={{ width: "25%", minWidth: '100px' }} variant="outlined" color={formik.values.notification_type == "value" ? "success" : "primary"} onClick={() => {
                if (formik.values.notification_type == "value") {
                  formik.setFieldValue("notification_type", "percentage")
                } else {
                  formik.setFieldValue("notification_type", "value")
                }
              }}>{formik.values.notification_type}</Button>

              <TextField
                fullWidth
                label="Stock"
                {...getFieldProps('stock')}
                error={Boolean(touched.stock && errors.stock)}
                helperText={touched.stock && errors.stock}
              />

              {
                formik.values.notification_type == "percentage" ?
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Interval</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={formik.values.type}
                      label="Interval"
                      onChange={handleChange}
                    >
                      <MenuItem value={"daily"}>Daily</MenuItem>
                      <MenuItem value={"hourly"}>Hourly</MenuItem>
                    </Select>
                  </FormControl>
                :
                  <div></div>
              }

              <TextField
                fullWidth
                label={formik.values.notification_type == "value" ? "Value" : "Percentage"}
                {...getFieldProps('value')}
                error={Boolean(touched.value && errors.value)}
                helperText={touched.value && errors.value}
              />
              
            </Stack>
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Upload
            </LoadingButton>
          </Form>
        </FormikProvider>
      </Box>
    </Card>
  );
}
