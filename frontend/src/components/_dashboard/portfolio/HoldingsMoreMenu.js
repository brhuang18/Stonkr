import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/external-link-outline';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import DeletePortfolio from '../portfolio/DeletePortfolio';
import EditPortfolio from '../portfolio/EditPortfolio';
// ----------------------------------------------------------------------

export default function HoldingsMoreMenu (props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const {portfolioID, portfolioName, setData, setFilteredData} = props;

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
        <EditPortfolio
        portfolioID = {portfolioID}
        portfolioName = {portfolioName}
        setData={setData}
        setFilteredData={setFilteredData}
        />
      </Menu>
    </>
  );
}
