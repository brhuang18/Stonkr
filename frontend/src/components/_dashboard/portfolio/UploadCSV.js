// material
import { Card, Box, Typography, CardHeader, Tooltip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import back from '@iconify/icons-eva/arrow-back-fill';
// utils
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { UploadCSVForm, UploadSingleFile } from '.';

// ----------------------------------------------------------------------

export default function UploadCSV() {
  const params = useParams()
  const navigate = useNavigate();
  const location = useLocation();
  const cur_path = location.pathname.split("/")[4]
  return (
    <Card sx={{ mt: '24px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: '24px', pt: '24px', pb: "0px"}}>
        <Typography variant= 'h5'>
          Upload CSV
        </Typography>
        <Tooltip title="Back to portfolio">
          <IconButton onClick={() => {
            navigate(`/dashboard/portfolio/${params.portfolio_id}/${cur_path}/overview`)
          }}>
            <Icon icon={back} />
          </IconButton>
         </Tooltip>
      </Box>
      <Box sx={{ p: 3 }} dir="ltr">
        <UploadCSVForm />
      </Box>
    </Card>
  );
}
