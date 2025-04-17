/* eslint-disable */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
// mocks_
import account from '../../../_mock/account';
import { useUser } from 'src/UserContext';
import { getOrg } from 'src/api';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orgId, setOrgId } = useUser();
  const { userType, setUserType } = useUser();
  const [open, setOpen] = useState(null);

  const [orgDetails, setOrgDetails] = useState({});

  useEffect(() => {
    // Get userType from context or localStorage
    const currentUserType = userType || localStorage.getItem('userType');
    // Get orgId from context or localStorage
    const currentOrgId = orgId || localStorage.getItem('orgId');
    
    // Fetch organization details on component mount
    if (currentUserType === 'orgAdmin' && currentOrgId) {
      getOrg(currentOrgId).then((res) => {
        setOrgDetails(res);
      });
    }
  }, [userType, orgId]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (userType === 'superAdmin' || localStorage.getItem('userType') === 'superAdmin') {
      setUserType(null);
      setOrgId(null);
      localStorage.removeItem('userType');
      localStorage.removeItem('orgId');
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } else {
      setUserType(null);
      setOrgId(null);
      localStorage.removeItem('userType');
      localStorage.removeItem('orgId');
      localStorage.removeItem('token');
      navigate('/loginorg', { replace: true });
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {(userType === 'orgAdmin' || localStorage.getItem('userType') === 'orgAdmin') 
              ? orgDetails?.organizationName 
              : 'Admin'
            }
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {(userType === 'orgAdmin' || localStorage.getItem('userType') === 'orgAdmin') 
              ? orgDetails?.organizationAdminEmail 
              : ''
            }
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
/* eslint-enable */
