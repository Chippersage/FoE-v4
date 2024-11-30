import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  margin: '20px auto',
  padding: '20px',
  maxWidth: '800px',
});

const LearnersProgressChart = ({ data }) => {
  console.log(data)
  const learners = data?.users || [];
  const learnerNames = learners.map((user) => user.userId);
  const subconceptsCompleted = learners.map((user) => user.completedSubconcepts);

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
      },
    },
    xaxis: {
      categories: learnerNames,
      tickPlacement: 'on',
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Activities Completed',
      },
      max: Math.max(...subconceptsCompleted, learners[0].totalSubconcepts),
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
  };

  const chartSeries = [
    {
      name: 'Activities Completed',
      data: subconceptsCompleted,
    },
  ];

  return (
    <StyledCard >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Learners' Progress
        </Typography>
        {learnerNames.length ? (
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
        ) : (
          <Typography variant="body1" align="center">
            No data available to display.
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default LearnersProgressChart;
