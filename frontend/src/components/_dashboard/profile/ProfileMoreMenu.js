import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';

import edit_pass from '@iconify/icons-eva/lock-fill';
import EditDetails from './EditDetails';
import EditPassword from './EditPassword';
import private_icon from '@iconify/icons-eva/lock-outline';
import axios from 'axios'

// ----------------------------------------------------------------------

export default function ProfileMoreMenu(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = props;

  function handlePrivate () {
    let data = {
      user_id: localStorage.getItem("user_id"),
      privacy: true
    }

    if (user.privacy == true) data['privacy'] = false

    axios.put('http://127.0.0.1:8000/user/edit/', data, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem("user_token")
        }
      }).then(function (res) {
        if (res.status == "200") {
          setUser(res.data.data)
        }
      }).catch(function (err) {
        let err_status = err.response.status;
        let err_msg = err.response.data.error_message;
        console.log(err_msg)
        if (err_status == "404") {
          console.log(err_msg)
        } else if (err_status == "403") {
          console.log(err_msg)
        } else if (err_status == "400") {
          console.log(err_msg)
        }
      })
  }

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <EditDetails user={user} setUser={setUser}/>
        <EditPassword />
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handlePrivate}>
          <ListItemIcon>
            <Icon icon={private_icon} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary={user.privacy == true ? "Unprivate Profile" : "Private Profile" } primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
    </>
  );
}
