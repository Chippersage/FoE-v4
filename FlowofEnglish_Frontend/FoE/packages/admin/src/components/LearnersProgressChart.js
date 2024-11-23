import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  margin: '20px auto',
  padding: '20px',
  maxWidth: '800px',
});

const BarChart = ({ data }) => {
  // Extract learners and their subconcepts data
  const learners = Object.values(data[0]?.learners || {});
  const subconceptsCompleted = learners.map((learner) => learner.subconcepts_completed);
  const learnerNames = learners.map((learner) => learner.learnerId);

  // Chart Configuration
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true, // Show toolbar for zooming/panning options
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%', // Set a fixed width for bars
      },
    },
    xaxis: {
      categories: learnerNames,
      tickPlacement: 'on',
      labels: {
        rotate: -45, // Rotate labels for better readability
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Subconcepts Completed',
      },
      max: 54
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Disable grid lines for x-axis
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels for cleaner visualization
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 300,
          },
          xaxis: {
            labels: {
              rotate: -30,
            },
          },
        },
      },
    ],
  };

  const chartSeries = [
    {
      name: 'Subconcepts Completed',
      data: subconceptsCompleted,
    },
  ];

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Learners' Progress
        </Typography>
        <div
          style={{
            overflowX: 'auto', // Enable horizontal scrolling
            overflowY: 'hidden', // Hide vertical scrolling
            maxWidth: '100%',
            scrollbarWidth: 'thin', // For Firefox
          }}
        >
          {/* Horizontal scrollbar styling */}
          <style>
            {`
              /* Horizontal scrollbar styles */
              .scroll-container::-webkit-scrollbar {
                height: 8px; /* Height of the scrollbar */
              }
              .scroll-container::-webkit-scrollbar-thumb {
                background: linear-gradient(to right, #6a11cb, #2575fc); /* Thumb gradient */
                border-radius: 10px; /* Rounded corners */
              }
              .scroll-container::-webkit-scrollbar-thumb:hover {
                background: #555; /* Change color on hover */
              }
              .scroll-container::-webkit-scrollbar-track {
                background: #f0f0f0; /* Track background */
                border-radius: 10px; /* Rounded track corners */
              }
            `}
          </style>
          <div className="scroll-container">
            <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
          </div>
        </div>
      </CardContent>
    </StyledCard>
  );
};

export default BarChart;
