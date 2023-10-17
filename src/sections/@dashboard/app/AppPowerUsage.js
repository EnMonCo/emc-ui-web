import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box } from '@mui/material';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppPowerUsage.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppPowerUsage({ title, subheader, fill, predictDataCount, chartLabels, chartData, ...other }) {
  // console.log(chartData);
  // console.log(chartLabels);
  const chartOptions = merge(BaseOptionChart(), {
    plotOptions: { bar: { columnWidth: '16%' } },
    fill,
    forecastDataPoints: {
      count: predictDataCount,
    },
    labels: chartLabels,
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(2)} W/h`;
          }
          return y;
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      {/*<Box sx={{ p: 3, pb: 1 }} dir='ltr'>*/}
        <ReactApexChart type='line' series={chartData} options={chartOptions} height={364} />
      {/*</Box>*/}
    </Card>
  );
}
