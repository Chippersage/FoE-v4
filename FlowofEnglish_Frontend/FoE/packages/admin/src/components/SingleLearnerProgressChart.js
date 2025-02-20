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
//       pointerEvents: 'none', // Prevent hover effects
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
//             Learner Progress
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
//     <StyledCard >
//       <CardContent>
//         <Typography
//           variant="h5"
//           align="center"
//           gutterBottom
//           style={{ fontWeight: 'bold', marginBottom: '20px', color: '#444' }}
//         >
//           Learner Progress Overview
//         </Typography>
//         <Grid container spacing={4}>
//           {/* Stages Chart */}
//           <Grid item xs={12} sm={4}>
//             <ChartWrapper>
//               <ReactApexChart
//                 options={createChartOptions('Stages Progress', ['#e27373', '#e5adad'])}
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
//                 options={createChartOptions('Units Progress', ['#2196f3', '#94d2ff'])}
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
//                 options={createChartOptions('Activities Progress', ['#ff9800', '#ffc56a'])}
//                 series={subconceptsChartSeries}
//                 type="pie"
//                 height={300}
//               />
//             </ChartWrapper>
//           </Grid>
//         </Grid>
//         <Typography variant="body2" color="textSecondary" align="center" sx={{ marginTop: 2 }}>
//           Leaderboard Score: {data.leaderboardScore}
//         </Typography>
//       </CardContent>
      
//     </StyledCard>
//   );
// };

// export default UserProgressCharts;
