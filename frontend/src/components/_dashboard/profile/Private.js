import PropTypes from 'prop-types';
// material
import { Paper, Typography, Card } from '@mui/material';

// ----------------------------------------------------------------------

Private.propTypes = {
  searchQuery: PropTypes.string
};

export default function Private () {
  return (
    <Card sx={{ px: "24px", py: '48px' }}>
      <Paper>
      <Typography gutterBottom align="center" variant="subtitle1">
          Not Avaliable
      </Typography>
      <Typography variant="body2" align="center">
          The Following Profile is Private
      </Typography>
      <Typography variant="body2" align="center">
          Please view another Profile
      </Typography>
      </Paper>
    </Card>
  );
}
