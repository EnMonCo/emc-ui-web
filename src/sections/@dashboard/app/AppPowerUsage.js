import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader } from '@mui/material';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppPowerUsage.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  fill: PropTypes.object,
  predictDataCount: PropTypes.number,
  waveletLastIdx: PropTypes.number,
  chartData: PropTypes.array.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppPowerUsage({ title, subheader, fill, predictDataCount, waveletLastIdx, chartLabels, chartData, ...other }) {
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
        formatter: (y, dataInfo) => {
          if (typeof y !== 'undefined') {
            if (waveletLastIdx !== -1 && dataInfo.dataPointIndex <= waveletLastIdx) {
              return `${y.toFixed(2)} W/h (wavelet reconstructed)`;
            }
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
