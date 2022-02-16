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

import edit_pass from '@iconify/icons-eva/lock-fill';
import { useFormik, Form, FormikProvider } from 'formik';
import axios from 'axios';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useParams } from 'react-router';

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

export default function EditPassword () {
  const params = useParams();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

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

  const ResetSchema = Yup.object().shape({
    old_password: Yup.string(),
    new_password: Yup.string(),
    confirm_new_password: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_new_password: '',
    },
    validationSchema: ResetSchema,
    onSubmit: () => {
      axios.put('http://127.0.0.1:8000/user/edit_password/', {
        user_id: localStorage.getItem('user_id'),
        original_password: formik.values.old_password,
        new_password: formik.values.new_password,
        confirm_new_password: formik.values.confirm_new_password,
      }, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "200") {
          handleClick2()
          formik.resetForm()
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.error_message;
        if (err_status == "404") {
          console.log(err_msg)
        } else if (err_status == "403") {
          console.log(err_msg)
        } else if (err_status == "400") {
          if (err_msg == "Password Validation Error") {
            formik.setFieldError("old_password", err_msg)
          } else if (err_msg == "Passwords are not matching!") {
            formik.setFieldError("new_password", err_msg)
            formik.setFieldError("confirm_new_password", err_msg)
          } else {
            console.log(err_msg)
          }
        }
        formik.setSubmitting(false)
      })
    }
  });

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      <MenuItem sx={{ color: 'text.secondary' }} onClick={handleClickOpen}>
        <ListItemIcon>
          <Icon icon={edit_pass} width={24} height={24} />
        </ListItemIcon>
        <ListItemText primary="Change Password" primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Change Your Password
        </BootstrapDialogTitle>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Stack spacing={3}>
              <TextField
                  fullWidth
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Old Password"
                  {...getFieldProps('old_password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={Boolean(touched.old_password && errors.old_password)}
                  helperText={touched.old_password && errors.old_password}
                />

                <TextField
                  fullWidth
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  {...getFieldProps('new_password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={Boolean(touched.new_password && errors.new_password)}
                  helperText={touched.new_password && errors.new_password}
                />

                <TextField
                  fullWidth
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  {...getFieldProps('confirm_new_password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={Boolean(touched.confirm_new_password && errors.confirm_new_password)}
                  helperText={touched.confirm_new_password && errors.confirm_new_password}
                />
              </Stack>
              <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
                <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                  Password Upated Successfully!
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
