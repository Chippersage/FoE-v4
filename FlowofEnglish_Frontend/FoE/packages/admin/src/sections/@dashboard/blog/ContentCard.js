import React, { useState } from "react";

import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';


// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Link, Card, Grid, Avatar, Typography, CardContent, Button, Popover, IconButton, Menu, MenuItem } from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledCardMedia = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)',
});

const StyledTitle = styled(Link)({
  height: 64,
  overflow: 'hidden',
  WebkitLineClamp: 3,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: 'absolute',
  left: theme.spacing(3),
  bottom: theme.spacing(-2),
}));

const StyledInfo = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(1),
  color: theme.palette.text.disabled,
  WebkitLineClamp: 1,
  overflow: 'hidden',
  fontSize: '10px'
}));

const StyledCover = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

ContentCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
};


export default function ContentCard({ post, index, handleEdit, setIsConfirmOpen, setSelectedRow }) {
  const { content, step } = post;
  const [isdragging, setIsDragging] = useState(false);


  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'action-popover' : undefined;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "card",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  return (
    <Grid item xs={12} sm={6} md={4}
      ref={drag}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      isdragging={isdragging.toString()}


    >
      <Card sx={{
        opacity: isdragging ? 0.5 : 1,
        cursor: 'move',
        marginBottom: '8px',
        backgroundColor: (step === 0 || step === "" || step === null) ? '#cccccc' : 'transparent',
      }}>
        <CardContent
          sx={{ pt: 4 }}
        >

          <IconButton
            aria-controls="actions-menu"
            aria-haspopup="true"
            onClick={handleClick}
            size="small"
            sx={{ position: 'absolute', top: '8px', right: '8px' }}
          >
            <Iconify icon={'eva:more-vertical-fill'} />
          </IconButton>
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            keepMounted
          >
            <MenuItem onClick={() => {
              handleEdit(post);
              handleClose();
            }} >Edit</MenuItem>
            <MenuItem
              onClick={() => {
                setSelectedRow(post);
                setIsConfirmOpen(true);
              }}
            >Delete</MenuItem>
          </Menu>

          <Typography gutterBottom variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {content.type}
          </Typography>

          <StyledTitle
            color="inherit"
            variant="subtitle2"
            underline="hover"
          >
            {content.content}
          </StyledTitle>
          {/* <StyledInfo>
            WorkFlow: {content.tt_workflow_id}
          </StyledInfo> */}
          <StyledInfo>
            Step: {step} | {(content.template && content.template.trim() !== "") ? content.template.trim() : 'NA'}
          </StyledInfo>
        </CardContent>
      </Card>
    </Grid>
  );
}

