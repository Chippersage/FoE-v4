import React, { useState } from "react";

import { useDrag, useDrop } from 'react-dnd';
import { Box, Card, CardContent } from '@mui/material';

const DraggableItem = ({ id, text, onDrop }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'card',
      item: { id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));
  
    return (
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {text}
      </div>
    );
  };
  

const DroppableArea = ({children}) => {

    const [draggableItems, setDraggableItems] = useState([]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'card',
    drop: (item) => handleDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleAddItem = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem = {
      id: newId,
      text: `Item ${newId}`,
    };

    // Add the new item to the state
    setDraggableItems((prevItems) => [...prevItems, newItem]);
  };

  const handleDrop = (itemId) => {
    console.log('Item dropped!',itemId)
   // Update the state with the dropped item
   setDraggableItems((prevItems) => {
    const updatedItems = prevItems.filter((item) => item.index !== item.itemId);
    return updatedItems;
  });
  };


  return (
    <Box
    ref={drop}
    isOver={isOver}
      sx={{
        backgroundColor: isOver ? 'lightblue' : 'white',
        minHeight: '100px',
        padding: '16px',
        border: '1px dashed gray',
        borderRadius: '4px',
        width: '100%',
      }}
    >
         {draggableItems.map((item) => (
        <DraggableItem key={item.id} id={item.id} text={item.text} />
      ))}
      <button onClick={handleAddItem}>Add Item</button>
           {children}


    </Box>
  );
};

export default DroppableArea; 
