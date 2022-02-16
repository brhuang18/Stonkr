import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import EditHolding from './EditHolding';
import RemoveHolding from './RemoveHolding';
import React from 'react'
import axios from 'axios'
import { useParams } from 'react-router';
// ----------------------------------------------------------------------

export default function WatchlistHoldingsMoreMenu(props) {
  const ref = useRef(null);
  const params = useParams()
  const [isOpen, setIsOpen] = useState(false);
  const [valid, setValid] = React.useState(false);
  const {watchlistID, stockTicker, setData, setFilteredData} = props;

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/watchlist/get?watchlist_id=${params.watchlist_id}&user=${localStorage.getItem("user_id")}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      if (res.data.user_id == localStorage.getItem("user_id")) {
        //this is the current user generate button
        setValid(true)
      }
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  return (
    <div>
      { valid ? (
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
            <RemoveHolding 
            watchlistID = {watchlistID}
            stockTicker = {stockTicker}
            setData={setData}
            setFilteredData={setFilteredData}
            />
          </Menu>
        </>
      ): (
        <div />
      )}
    </div>
  );
}
