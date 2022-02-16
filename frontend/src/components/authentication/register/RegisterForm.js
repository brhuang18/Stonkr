import * as Yup from 'yup';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormik, Form, FormikProvider } from 'formik';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useNavigate } from 'react-router-dom';
// material
import { Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import axios from 'axios';

// ----------------------------------------------------------------------

const signup = ({email}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email == 'alexliu1296@gmail.com') {
        reject(new Error('you done goofed'))
      }
      resolve(true)
    }, 1000)
  })
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('First name required'),
    lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    username: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Username name required'),
    password: Yup.string().required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: ''
    },
    validationSchema: RegisterSchema,
    onSubmit: () => {
      axios.post('http://127.0.0.1:8000/auth/register/', {
        email: formik.values.email,
        username: formik.values.username,
        first_name: formik.values.firstName,
        last_name: formik.values.lastName,
        password: formik.values.password,
      }).then(function (res) {
        if (res.status == "200") {
          localStorage.setItem("user_token", res.data.token)
          localStorage.setItem("user_id", res.data.user_id)
          navigate('/dashboard', { replace: true });
        }
      }).catch(function (err) {
        if (err.response.status == "403") {
          let err_msg = err.response.data.error_message
          if (err_msg == "Email is already in use!") {
            formik.setFieldError("email", err_msg)
            formik.setSubmitting(false)
          } else if (err_msg == "That username is already in use!") {
            formik.setFieldError("username", err_msg)
            formik.setSubmitting(false)
          }
        } else if (err.response.status == "401") {
          let err_msg = err.response.data.error_message
          if (err_msg == "Invalid details") {
            formik.setFieldError("email", err_msg)
            formik.setFieldError("username", err_msg)
            formik.setFieldError("first_name", err_msg)
            formik.setFieldError("last_name", err_msg)
            formik.setFieldError("password", err_msg)
            formik.setSubmitting(false)
          } else if (err_msg == "Invalid username/email or password") {
            formik.setFieldError("email", err_msg)
            formik.setFieldError("username", err_msg)
            formik.setFieldError("first_name", err_msg)
            formik.setFieldError("last_name", err_msg)
            formik.setFieldError("password", err_msg)
            formik.setSubmitting(false)
          }
        }
      })
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="First name"
              {...getFieldProps('firstName')}
              error={Boolean(touched.firstName && errors.firstName)}
              helperText={touched.firstName && errors.firstName}
            />

            <TextField
              fullWidth
              label="Last name"
              {...getFieldProps('lastName')}
              error={Boolean(touched.lastName && errors.lastName)}
              helperText={touched.lastName && errors.lastName}
            />
          </Stack>

          <TextField
            fullWidth
            autoComplete="email"
            type="email"
            label="Email address"
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Username"
            {...getFieldProps('username')}
            error={Boolean(touched.username && errors.username)}
            helperText={touched.username && errors.username}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Register
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
