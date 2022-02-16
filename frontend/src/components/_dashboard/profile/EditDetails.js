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

export default function EditPassword (props) {
  const params = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const { user, setUser } = props;

  // handle dialog
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
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

  const [showPassword, setShowPassword] = React.useState(false);

  const EditSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('First name required'),
    lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    username: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Username name required'),
  });

  const formik = useFormik({
    initialValues: {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
    },
    validationSchema: EditSchema,
    onSubmit: () => {
      let data = {
        user_id: localStorage.getItem('user_id'),
      }
      if (user.email != formik.values.email) {
        data['email'] = formik.values.email
      } 
      if (user.first_name != formik.values.firstName) {
        data['first_name'] = formik.values.firstName
      }
      if (user.last_name != formik.values.lastName) {
        data['last_name'] = formik.values.lastName
      }
      if (user.username != formik.values.username) {
        data['username'] = formik.values.username
      }

      axios.put('http://127.0.0.1:8000/user/edit/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "200") {
          handleClick2()
          setUser(res.data.data)
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.error_message;
        if (err_status == "404") {
          console.log(err_msg)
        } else if (err_status == "403") {
          if (err_msg == "Email is already in use!") {
            formik.setFieldError("email", err_msg)
          } else if (err_msg == "That username is already in use!") {
            formik.setFieldError("username", err_msg)
          } else {
            console.log(err_msg)
          }
        } else if (err_status == "400") {
          console.log(err_msg)
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      <MenuItem sx={{ color: 'text.secondary' }} onClick={handleClickOpen}>
        <ListItemIcon>
          <Icon icon={edit_dets} width={24} height={24} />
        </ListItemIcon>
        <ListItemText primary="Edit Account" primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Edit Account Details
        </BootstrapDialogTitle>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogContent dividers>
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
                  placeholder={user.last_name}
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

              </Stack>
              <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
                <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                  Account Upated Successfully!
                </Alert>
              </Snackbar>
            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit">
                Save changes
              </Button>
            </DialogActions>
          </Form>
        </FormikProvider>
      </BootstrapDialog>
    </div>
  );
}
