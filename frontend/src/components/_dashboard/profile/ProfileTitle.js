import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography, IconButton, Tooltip, Avatar } from '@mui/material';
// utils
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import follow from '@iconify/icons-eva/person-add-fill';
import EditPassword from './EditPassword';
import EditDetails from './EditDetails';
import ProfileMoreMenu from './ProfileMoreMenu';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

import axios from 'axios';
import React from 'react';
import { useParams } from 'react-router';
// import account from '../../_mocks_/account';
import account from '../../../_mocks_/account';

// ----------------------------------------------------------------------

export default function ProfileTitle(props) {
  const { user, setUser } = props
  const params = useParams()

  return (
    <Card>
      <Box sx={{ display: 'flex', flexDirection: 'column' }} dir="ltr">
        <Box sx={{ height: '79px', backgroundColor: '#2962ff', opacity: '0.85' }} />
        <Box sx={{ display: 'flex', px: 3, pb: 3, justifyContent: 'space-between'}}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                width: '1-0px',
                height: '110px',
                mb: 1,
                mt: '-55px',
                bgcolor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar src={account.photoURL} alt="dp" sx={{ height: '100px', width: '100px' }} />
            </Box>
          </Box>
          <Box sx={{ height: '40px', mt: 1, display: 'flex' }}>
            {params.user_id != "me" ? (
              <div />
            ) : (
              <ProfileMoreMenu user={user} setUser={setUser}/>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
