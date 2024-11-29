import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  margin: '20px auto',
  padding: '20px',
  maxWidth: '900px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  borderRadius: '10px',
});

const ChartWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
});

const createChartOptions = (title, colors) => ({
  chart: {
    type: 'pie',
  },
  labels: ['Completed', 'Remaining'],
  title: {
    text: title,
    align: 'center',
    style: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      pointerEvents: 'none', // Prevent hover effects
    },
  },
  colors,
  legend: {
    position: 'bottom',
    fontSize: '14px',
    labels: {
      colors: ['#333'],
    },
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
          height: 250,
        },
        legend: {
          fontSize: '12px',
        },
      },
    },
  ],
});

const UserProgressCharts = ({ data }) => {
  if (!data) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Progress
          </Typography>
          <Typography variant="body1" align="center">
            No data available to display.
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  const { totalStages, completedStages, totalUnits, completedUnits, totalSubconcepts, completedSubconcepts } = data;

  const stagesChartSeries = [completedStages, totalStages - completedStages];
  const unitsChartSeries = [completedUnits, totalUnits - completedUnits];
  const subconceptsChartSeries = [completedSubconcepts, totalSubconcepts - completedSubconcepts];

  return (
    <StyledCard >
      <CardContent>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          style={{ fontWeight: 'bold', marginBottom: '20px', color: '#444' }}
        >
          User Progress Overview
        </Typography>
        <Grid container spacing={4}>
          {/* Stages Chart */}
          <Grid item xs={12} sm={4}>
            <ChartWrapper>
              <ReactApexChart
                options={createChartOptions('Stages Progress', ['#e27373', '#e5adad'])}
                series={stagesChartSeries}
                type="pie"
                height={300}
              />
            </ChartWrapper>
          </Grid>

          {/* Units Chart */}
          <Grid item xs={12} sm={4}>
            <ChartWrapper>
              <ReactApexChart
                options={createChartOptions('Units Progress', ['#2196f3', '#94d2ff'])}
                series={unitsChartSeries}
                type="pie"
                height={300}
              />
            </ChartWrapper>
          </Grid>

          {/* Subconcepts Chart */}
          <Grid item xs={12} sm={4}>
            <ChartWrapper>
              <ReactApexChart
                options={createChartOptions('Subconcepts Progress', ['#ff9800', '#ffc56a'])}
                series={subconceptsChartSeries}
                type="pie"
                height={300}
              />
            </ChartWrapper>
          </Grid>
        </Grid>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ marginTop: 2 }}>
          Leaderboard Score: {data.leaderboardScore}
        </Typography>
      </CardContent>
      
    </StyledCard>
  );
};

export default UserProgressCharts;

// import React from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { Card, CardContent, Typography, Grid } from '@mui/material';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)({
//   margin: '20px auto',
//   padding: '20px',
//   maxWidth: '900px',
//   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//   borderRadius: '10px',
// });

// const ChartWrapper = styled('div')({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   textAlign: 'center',
// });

// const createChartOptions = (title, colors) => ({
//   chart: {
//     type: 'pie',
//   },
//   labels: ['Completed', 'Remaining'],
//   title: {
//     text: title,
//     align: 'center',
//     style: {
//       fontSize: '18px',
//       fontWeight: '600',
//       color: '#333',
//     },
//   },
//   colors,
//   legend: {
//     position: 'bottom',
//     fontSize: '14px',
//     labels: {
//       colors: ['#333'],
//     },
//   },
//   tooltip: {
//     y: {
//       formatter: (val) => `${val}`,
//     },
//   },
//   responsive: [
//     {
//       breakpoint: 600,
//       options: {
//         chart: {
//           height: 250,
//         },
//         legend: {
//           fontSize: '12px',
//         },
//       },
//     },
//   ],
// });

// const UserProgressCharts = ({ data }) => {
//   if (!data) {
//     return (
//       <StyledCard>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             User Progress
//           </Typography>
//           <Typography variant="body1" align="center">
//             No data available to display.
//           </Typography>
//         </CardContent>
//       </StyledCard>
//     );
//   }

//   const { totalStages, completedStages, totalUnits, completedUnits, totalSubconcepts, completedSubconcepts } = data;

//   const stagesChartSeries = [completedStages, totalStages - completedStages];
//   const unitsChartSeries = [completedUnits, totalUnits - completedUnits];
//   const subconceptsChartSeries = [completedSubconcepts, totalSubconcepts - completedSubconcepts];

//   return (
//     <StyledCard>
//       <CardContent>
//         <Typography
//           variant="h5"
//           align="center"
//           gutterBottom
//           style={{ fontWeight: 'bold', marginBottom: '20px', color: '#444' }}
//         >
//           User Progress Overview
//         </Typography>
//         <Grid container spacing={4}>
//           {/* Stages Chart */}
//           <Grid item xs={12} sm={4}>
//             <ChartWrapper>
//               <ReactApexChart
//                 options={createChartOptions('Stages Progress', ['#4caf50', '#e0e0e0'])}
//                 series={stagesChartSeries}
//                 type="pie"
//                 height={300}
//               />
//             </ChartWrapper>
//           </Grid>

//           {/* Units Chart */}
//           <Grid item xs={12} sm={4}>
//             <ChartWrapper>
//               <ReactApexChart
//                 options={createChartOptions('Units Progress', ['#2196f3', '#e3f2fd'])}
//                 series={unitsChartSeries}
//                 type="pie"
//                 height={300}
//               />
//             </ChartWrapper>
//           </Grid>

//           {/* Subconcepts Chart */}
//           <Grid item xs={12} sm={4}>
//             <ChartWrapper>
//               <ReactApexChart
//                 options={createChartOptions('Subconcepts Progress', ['#ff9800', '#fff3e0'])}
//                 series={subconceptsChartSeries}
//                 type="pie"
//                 height={300}
//               />
//             </ChartWrapper>
//           </Grid>
//         </Grid>
//       </CardContent>
//     </StyledCard>
//   );
// };

// export default UserProgressCharts;

// import React from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { Card, CardContent, Typography, Grid } from '@mui/material';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)({
//   margin: '20px auto',
//   padding: '20px',
//   maxWidth: '800px',
// });

// const UserProgressCharts = ({ data }) => {
//   if (!data) {
//     return (
//       <StyledCard>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             User Progress
//           </Typography>
//           <Typography variant="body1" align="center">
//             No data available to display.
//           </Typography>
//         </CardContent>
//       </StyledCard>
//     );
//   }

//   const { totalStages, completedStages, totalUnits, completedUnits, totalSubconcepts, completedSubconcepts } = data;

//   const createChartOptions = (title, completed, total) => ({
//     chart: {
//       type: 'pie',
//     },
//     labels: ['Completed', 'Remaining'],
//     title: {
//       text: title,
//       align: 'center',
//       style: {
//         fontSize: '16px',
//       },
//     },
//     tooltip: {
//       y: {
//         formatter: (val) => `${val}`,
//       },
//     },
//   });

//   const stagesChartSeries = [completedStages, totalStages - completedStages];
//   const unitsChartSeries = [completedUnits, totalUnits - completedUnits];
//   const subconceptsChartSeries = [completedSubconcepts, totalSubconcepts - completedSubconcepts];

//   return (
//     <StyledCard>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           User Progress Overview
//         </Typography>
//         <Grid container spacing={4}>
//           {/* Stages Chart */}
//           <Grid item xs={12} sm={4}>
//             <ReactApexChart
//               options={createChartOptions('Stages', completedStages, totalStages)}
//               series={stagesChartSeries}
//               type="pie"
//               height={300}
//             />
//           </Grid>

//           {/* Units Chart */}
//           <Grid item xs={12} sm={4}>
//             <ReactApexChart
//               options={createChartOptions('Units', completedUnits, totalUnits)}
//               series={unitsChartSeries}
//               type="pie"
//               height={300}
//             />
//           </Grid>

//           {/* Subconcepts Chart */}
//           <Grid item xs={12} sm={4}>
//             <ReactApexChart
//               options={createChartOptions('Subconcepts', completedSubconcepts, totalSubconcepts)}
//               series={subconceptsChartSeries}
//               type="pie"
//               height={300}
//             />
//           </Grid>
//         </Grid>
//       </CardContent>
//     </StyledCard>
//   );
// };

// export default UserProgressCharts;

// import React from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { Card, CardContent, Typography } from '@mui/material';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)({
//   margin: '20px auto',
//   padding: '20px',
//   maxWidth: '800px',
// });

// const PieChart = ({ data }) => {
//     console.log(data);
//   if (!data) {
//     return (
//       <StyledCard>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             User Progress
//           </Typography>
//           <Typography variant="body1" align="center">
//             No data available to display.
//           </Typography>
//         </CardContent>
//       </StyledCard>
//     );
//   }

//   const { totalStages, completedStages, totalUnits, completedUnits, totalSubconcepts, completedSubconcepts } = data;

//   const chartOptions = {
//     chart: {
//       type: 'pie',
//     },
//     labels: [
//       'Completed Stages',
//       'Pending Stages',
//       'Completed Units',
//       'Pending Units',
//       'Completed Subconcepts',
//       'Pending Subconcepts',
//     ],
//     tooltip: {
//       y: {
//         formatter: (val) => `${val}`,
//       },
//     },
//     responsive: [
//       {
//         breakpoint: 600,
//         options: {
//           chart: {
//             width: 300,
//           },
//           legend: {
//             position: 'bottom',
//           },
//         },
//       },
//     ],
//   };

//   const chartSeries = [
//     completedStages,
//     totalStages - completedStages,
//     completedUnits,
//     totalUnits - completedUnits,
//     completedSubconcepts,
//     totalSubconcepts - completedSubconcepts,
//   ];

//   return (
//     <StyledCard>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           User Progress Breakdown
//         </Typography>
//         <ReactApexChart options={chartOptions} series={chartSeries} type="pie" height={350} />
//         <Typography variant="body2" color="textSecondary" align="center" sx={{ marginTop: 2 }}>
//           Leaderboard Score: {data.leaderboardScore}
//         </Typography>
//       </CardContent>
//     </StyledCard>
//   );
// };

// export default PieChart;
