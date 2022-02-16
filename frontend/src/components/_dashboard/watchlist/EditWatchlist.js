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
import { useFormik, Form, FormikProvider, Field, ErrorMessage } from 'formik';
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

export default function EditWatchlist (props) {
  const params = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const {watchlistID, watchlistName, watchlistPrivacy, setData, setFilteredData} = props;

  // handle dialog
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    formik.resetForm()
    setOpen(false);
    setOpen2(false)
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


  const EditSchema = Yup.object().shape({
    watchlist_name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Watchlist name required'),
    watchlist_privacy: Yup.bool().required('Privacy setting is required'),
  });

  const formik = useFormik({
    initialValues: {
      watchlist_name: watchlistName,
      watchlist_privacy : watchlistPrivacy, //this should be provided in the props, haven't changed yet
    },
    validationSchema: EditSchema,
    onSubmit: () => {
      let data = {
        user: Number(localStorage.getItem("user_id")),
        watchlist_id : watchlistID,
      }
      if (watchlistName != formik.values.watchlist_name) {
        data['watchlist_name'] = formik.values.watchlist_name;
      } 
      if (watchlistPrivacy != formik.values.watchlist_privacy) {
        data['privacy'] = formik.values.watchlist_privacy;
      } 

      axios.put('http://127.0.0.1:8000/watchlist/edit/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "200") {
          handleClick2()
          axios.get(`http://127.0.0.1:8000/watchlist/getAll?user=${Number(localStorage.getItem("user_id"))}`, {
            headers: {
              Authorization: 'Token ' + localStorage.getItem("user_token")
            }
          }, null).then(function (res) {
            setData(res.data.watchlists)
            setFilteredData(res.data.watchlists)
          }).catch(function (err) {
            console.log("watchlist list error")
            console.log(err)
          })
          setTimeout(function(){ handleClose() }, 1500);

        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.response;
        console.log(err)
        console.log(err_msg)
        if (err_status == "400") {
          console.log(err_msg)
          formik.setFieldError("watchlist_name", "This Watchlist Name is Invalid/Already Taken!")
        } else if (err.status == "403") {
          console.log(err_msg)
          formik.setFieldError("watchlist_name", "You don't have permission to edit this watchlist!")
          formik.setFieldError("watchlist_privacy", "You don't have permission to edit this watchlist!")
        }
        formik.setSubmitting(false)
      })
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      <Tooltip title="Edit Watchlist" onClick={handleClickOpen}>
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
          Edit a Watchlist
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
              <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
                <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                  Watchlist Edited Successfully!
                </Alert>
              </Snackbar>
            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit">
                Edit Watchlist
              </Button>
            </DialogActions>
          </Form>
        </FormikProvider>
      </BootstrapDialog>
    </div>
  );
}
