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

export default function EditHolding (props) {
  const params = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const {portfolioID, portfolioName, setData, setFilteredData} = props;
  // const { user, setUser } = props;

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
    ticker: Yup.string()
      .min(1, 'Too Short!')
      .max(10, 'Too Long!')
      .required('Stock Ticker Required'),
  });

  const formik = useFormik({
    initialValues: {
      ticker: portfolioID,
    },
    validationSchema: EditSchema,
    onSubmit: () => {
      let data = {
        ticker : formik.values.ticker,
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <div>
      <Tooltip title="Edit Stock" onClick={handleClickOpen}>
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
          Edit a Stock
        </BootstrapDialogTitle>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogContent dividers>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Stock ticker"
                  {...getFieldProps('ticker')}
                  error={Boolean(touched.ticker && errors.ticker)}
                  helperText={touched.ticker && errors.ticker}
                />
              </Stack>
              </Stack>
              <Snackbar open={open2} autoHideDuration={6000} onClose={handleClose2}>
                <Alert onClose={handleClose2} severity="success" sx={{ width: '100%' }}>
                  Stock Edited Successfully!
                </Alert>
              </Snackbar>
            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit">
                Edit Stock
              </Button>
            </DialogActions>
          </Form>
        </FormikProvider>
      </BootstrapDialog>
    </div>
  );
}
