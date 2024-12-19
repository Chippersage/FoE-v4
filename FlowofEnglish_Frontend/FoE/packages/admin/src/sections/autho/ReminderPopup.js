import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const ReminderPopup = ({ reminders, onClose }) => {
  if (!reminders.length) return null;

  return (
    <Modal open={!!reminders.length} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2>Cohort Reminders</h2>
        <ul>
          {reminders.map((reminder, index) => (
            <li key={index}>{reminder}</li>
          ))}
        </ul>
        <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ReminderPopup;
