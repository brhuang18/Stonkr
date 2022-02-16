import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import private_icon from '@iconify/icons-eva/lock-outline';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import DeletePortfolio from '../portfolio/DeletePortfolio';
import EditPortfolio from '../portfolio/EditPortfolio';

import axios from 'axios'
// ----------------------------------------------------------------------

export default function UserMoreMenu(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const {portfolioID, portfolioName, setData, setFilteredData, privacy} = props;

  function handleToggle () {
    let data = {
      portfolio_id : portfolioID,
    }

    if (privacy == true) {
      data['privacy'] = false
    } else {
      data['privacy'] = true
    }

    axios.put('http://127.0.0.1:8000/portfolio/', data, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }).then(function (res) {
      if (res.status == "200") {
        axios.get('http://127.0.0.1:8000/portfolios/overview', {
          headers: {
            Authorization: 'Token ' + localStorage.getItem("user_token")
          }
        }, null).then(function (res) {
          setData(res.data.portfolios)
          setFilteredData(res.data.portfolios)
        }).catch(function (err) {
          console.log("portfolio list error")
          console.log(err)
        })
      }
    }).catch(function (err) {
      let err_status = err.response.status;
      let err_msg = err.response.data.error_message;
      console.log(err)
      console.log(err_msg)
      if (err_status == "400") {
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
        <DeletePortfolio 
          portfolioID = {portfolioID}
          setData={setData}
          setFilteredData={setFilteredData}
        />
        <EditPortfolio
          portfolioID = {portfolioID}
          portfolioName = {portfolioName}
          setData={setData}
          setFilteredData={setFilteredData}
        />
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleToggle}>
          <ListItemIcon>
            <Icon icon={private_icon} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Toggle Privacy" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
    </>
  );
}
