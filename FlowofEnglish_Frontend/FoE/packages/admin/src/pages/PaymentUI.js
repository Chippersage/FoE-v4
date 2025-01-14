import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  Box,
  Divider,
  Grid,
} from '@mui/material';

const courses = [
  { id: 1, name: 'Course 1', description: 'Introduction to React', cost: 50 },
  { id: 2, name: 'Course 2', description: 'Advanced React Patterns', cost: 100 },
  { id: 3, name: 'Course 3', description: 'Full-Stack Development', cost: 150 },
];

const PaymentUI = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);

  const handleSelect = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((courseId) => courseId !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    return selectedCourses.reduce(
      (total, courseId) =>
        total + courses.find((course) => course.id === courseId)?.cost,
      0
    );
  };

  const handlePayment = () => {
    alert(`You have selected courses worth $${calculateTotal()}. Proceeding to payment...`);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <Grid container spacing={2}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {course.description}
                </Typography>
                <Typography variant="body1" color="textPrimary">
                  Cost: ${course.cost}
                </Typography>
                <Box mt={2}>
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleSelect(course.id)}
                    color="primary"
                  />
                  <Typography variant="body2" display="inline">
                    Select this course
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider style={{ margin: '2rem 0' }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Total: ${calculateTotal()}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePayment}
          disabled={selectedCourses.length === 0}
        >
          Pay Now
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentUI;
