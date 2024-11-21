// @mui
import PropTypes from 'prop-types';
import { Box, Stack, Card, Button, Divider, Typography, CardHeader } from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Scrollbar from '../../../components/scrollbar';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppNewsUpdate.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function AppNewsUpdate({ title, subheader, list, onDelete, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {list.map((user) => (
            <UserItem key={user.id} user={user} onDelete={() => onDelete(user)} />
          ))}
        </Stack>
      </Scrollbar>

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button size="small" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
          View all
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

UserItem.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string,
    userName: PropTypes.string,
    cohortName: PropTypes.string,
    lastActivity: PropTypes.string,
  }),
};

function UserItem({ user }) {
  const { userId, userName, cohortName, lastActivity } = user;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* Column 1: User ID */}
      <Typography variant="body2" sx={{ minWidth: 100, flexShrink: 0, color: 'text.secondary' }}>
        {userId}
      </Typography>

      {/* Column 2: Username */}
      <Typography variant="body2" sx={{ minWidth: 150, flexGrow: 1, color: 'text.primary' }}>
        {userName}
      </Typography>

      {/* Column 3: Cohort Name */}
      <Typography variant="body2" sx={{ minWidth: 150, flexGrow: 1, color: 'text.secondary' }}>
        {cohortName}
      </Typography>

      {/* Column 4: Last Activity */}
      <Typography variant="body2" sx={{ minWidth: 150, flexShrink: 0, color: 'text.secondary' }}>
      {lastActivity ? fToNow(new Date(lastActivity)) : 'No Activity'}
      </Typography>
    </Stack>
  );
}
