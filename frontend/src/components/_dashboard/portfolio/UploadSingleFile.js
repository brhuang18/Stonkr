import { isString } from 'lodash';
import PropTypes from 'prop-types';
// import { useDropzone } from 'react-dropzone';
// material
import { alpha, styled } from '@mui/material/styles';
import { Paper, Box, Typography } from '@mui/material';
// utils
// import { fData } from '../../utils/formatNumber';
//
// import { UploadIllustration } from '../../assets';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  display: 'flex',
  overflow: 'hidden',
  textAlign: 'center',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(5, 0),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': {
    opacity: 0.72,
    cursor: 'pointer'
  },
  [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' }
}));

// ----------------------------------------------------------------------

UploadSingleFile.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sx: PropTypes.object
};

export default function UploadSingleFile({ error, file, sx, ...other }) {
  // const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
  //   multiple: false,
  //   ...other
  // });

  // const ShowRejectionItems = () => (
  //   <Paper
  //     variant="outlined"
  //     sx={{
  //       py: 1,
  //       px: 2,
  //       mt: 3,
  //       borderColor: 'error.light',
  //       bgcolor: (theme) => alpha(theme.palette.error.main, 0.08)
  //     }}
  //   >
  //     {fileRejections.map(({ file, errors }) => {
  //       const { path, size } = file;
  //       return (
  //         <Box key={path} sx={{ my: 1 }}>
  //           <Typography variant="subtitle2" noWrap>
  //             {path} - {size}
  //           </Typography>
  //           {errors.map((e) => (
  //             <Typography key={e.code} variant="caption" component="p">
  //               - {e.message}
  //             </Typography>
  //           ))}
  //         </Box>
  //       );
  //     })}
  //   </Paper>
  // );

  return (
    <Box sx={{ width: '100%', ...sx }}>

    </Box>
  );
}
