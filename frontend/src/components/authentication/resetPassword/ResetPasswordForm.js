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
  FormControlLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import axios from 'axios';

// ----------------------------------------------------------------------

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams()

  const LoginSchema = Yup.object().shape({
    reset_code: Yup.string().required('Reset Token is required'),
    password: Yup.string().required('Password is required').min(8, 'Password too short'),
  });

  const formik = useFormik({
    initialValues: {
      reset_code: params.token,
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: () => {
      axios.post('http://127.0.0.1:8000/auth/password_reset/confirm/', {
        password: formik.values.password,
        token: formik.values.reset_code,
      }, null)
      .then(function (res) {
        if (res.status == 200) {
          navigate('/dashboard', { replace: true });
        }
      }).catch(function (err) {
        if (err.response.status == '400') {
          try {
            if (err.response.data.password[0] == 'This password is too common.') {
              formik.setFieldError('password', err.response.data.password[0])
            }
          } catch (err) {
            console.log(err)
          }

          try {
            if (err.response.data.token[0] == 'This field is required.') {
              formik.setFieldError('reset_code', err.response.data.token[0])
            }
          } catch (err) {
            console.log(err)
          }
        } else if (err.response.status == '404') {
          try {
            if (err.response.data.detail[0] == 'Not found.') {
              formik.setFieldError('reset_code', err.response.data.token[0])
            }
          } catch (err) {
            console.log(err)
          }
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Reset Code"
            {...getFieldProps('reset_code')}
            error={Boolean(touched.reset_code && errors.reset_code)}
            helperText={touched.reset_code && errors.reset_code}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Reset Password
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
