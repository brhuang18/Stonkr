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
import { Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';
import add_icon from '@iconify/icons-eva/plus-outline';
import * as Yup from 'yup';

import { 
  Stack,
  TextField,
} from '@mui/material';

import { useFormik, Form, FormikProvider, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import { useLocation, useParams } from 'react-router';

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

export default function CreateWatchlist (props) {
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [valid, setValid] = React.useState(false);
  const {setData, setFilteredData} = props
  const location = useLocation()
  const params = useParams()

  React.useEffect(() => {
    if (location.pathname == "/dashboard/watchlist") {
      setValid(true)
    } else if (params.user_id == 'me') {
      setValid(true)
    }
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

  const EditSchema = Yup.object().shape({
    watchlist_name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Watchlist name required'),
    watchlist_privacy: Yup.bool().required('Privacy setting is required'),
  });

  const formik = useFormik({
    initialValues: {
      watchlist_name: "",
      watchlist_privacy: true,
    },
    validationSchema: EditSchema,
    onSubmit: () => {
      let data = {
        user: Number(localStorage.getItem("user_id")),
        watchlist_name : formik.values.watchlist_name,
        privacy : formik.values.watchlist_privacy
      }

      axios.post('http://127.0.0.1:8000/watchlist/create/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "201") {
          handleClick2()
          axios.get(`http://127.0.0.1:8000/watchlist/getAll?user=${Number(localStorage.getItem("user_id"))}`, {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null).then(function (res) {
            setData(res.data.watchlists)
            setFilteredData(res.data.watchlists)
          }).catch(function (err) {
            console.log("Watchlist list error")
          })
          handleClose()
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.response;
        console.log(err)
        if (err_status == "400") {
          console.log(err_msg)
          if (err_msg == "Enter a unique watchlist name.") {
            formik.setFieldError("watchlist_name", "This Watchlist Name is Invalid!")
          } else {
            console.log(err_msg)
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
          <Tooltip title="Create Watchlist" onClick={handleClickOpen}>
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
              Create a Watchlist
            </BootstrapDialogTitle>
            <FormikProvider value={formik}>
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <DialogContent dividers>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Watchlist name"
                      {...getFieldProps('watchlist_name')}
                      error={Boolean(touched.watchlist_name && errors.watchlist_name)}
                      helperText={touched.watchlist_name && errors.watchlist_name}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Field type="checkbox" name="watchlist_privacy" className={'form-check-input ' + (errors.watchlist_privacy && touched.watchlist_privacy ? ' is-invalid' : '')} />
                    <label htmlFor="watchlist_privacy" className="form-check-label">Private</label>
                    <ErrorMessage name="watchlist_privacy" component="div" className="invalid-feedback" />
                  </Stack>
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus type="submit">
                    Create Watchlist
                  </Button>
                </DialogActions>
              </Form>
            </FormikProvider>
          </BootstrapDialog>
        </div>
      ) : (
        <div/>
      )}
    </div>

  );
}
