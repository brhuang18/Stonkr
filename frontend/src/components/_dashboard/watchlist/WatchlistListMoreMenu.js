import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import DeletePortfolio from '../portfolio/DeletePortfolio';
import EditPortfolio from '../portfolio/EditPortfolio';
import EditWatchlist from './EditWatchlist';
import DeleteWatchlist from './DeleteWatchlist';
import React from 'react'
import { useParams, useLocation } from 'react-router';
// ----------------------------------------------------------------------

export default function WatchlistListMoreMenu(props) {
  const ref = useRef(null);
  const params = useParams()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false);
  const [valid, setValid] = useState(false)
  const {watchlistID, watchlistName, watchlistPrivacy, setData, setFilteredData} = props;

  React.useEffect(() => {
    if (location.pathname == "/dashboard/watchlist") {
      setValid(true)
    } else if (params.user_id == localStorage.getItem("user_id")) {
      setValid(true)
    }
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
            <DeleteWatchlist 
            watchlistID = {watchlistID}
            setData={setData}
            setFilteredData={setFilteredData}
            />

            <EditWatchlist
            watchlistID = {watchlistID}
            watchlistName = {watchlistName}
            watchlistPrivacy = {watchlistPrivacy}
            setData={setData}
            setFilteredData={setFilteredData}
            />
          </Menu>
        </>
      ) : (
        <div />
      )}
    </ div>
  );
}
