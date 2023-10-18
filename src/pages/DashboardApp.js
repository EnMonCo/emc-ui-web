import { useEffect, useRef, useState } from 'react';
import superagent from 'superagent';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box, CircularProgress,
  Container,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Typography,
} from '@mui/material';
// components
import Page from '../components/Page';
// sections
import { AppWidgetSummary } from '../sections/@dashboard/app';

import { EMC_METERS_V1 } from '../config';
import useAuth from '../hooks/useAuth';
import AppVoltageUsage from '../sections/@dashboard/app/AppVoltageUsage';
import AppPowerUsage from '../sections/@dashboard/app/AppPowerUsage';

// ----------------------------------------------------------------------

const MAX_PREDICT_COUNT = 3 * 60;

export default function DashboardApp() {
  const theme = useTheme();

  const [meters, setMeters] = useState([]);

  const { getUser } = useAuth();

  const [voltage, setVoltage] = useState(0.0);
  const [power, setPower] = useState(0.0);
  const [activeMeter, setActiveMeter] = useState(null);
  const [voltageHistory, setVoltageHistory] = useState([]);
  const [powerHistory, setPowerHistory] = useState([]);
  const [predictCount, setPredictCount] = useState(20);
  const [predictData, setPredictData] = useState([]);
  const [meterTimestamps, setMeterTimestamps] = useState([]);
  const [loadingMeters, setLoadingMeters] = useState(true);

  let waveletLastIdxRef = useRef(-1);

  const user = getUser();

  useEffect(() => {
    setLoadingMeters(true);
    superagent
      .get(`${EMC_METERS_V1}/users/${user.id}/meters`)
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then((res) => {
        if (res.body.length === 0) {
          return;
        }
        setMeters(res.body.data);
        setActiveMeter(res.body.data[0]);
        setLoadingMeters(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [user]);


  const intervalHandle = useRef(null);

  useEffect(() => {
    const fetchMeterData = (id) => {
      if (!id) {
        return;
      }
      superagent
        .get(`${EMC_METERS_V1}/meters/${id}/data/live`)
        .set('Authorization', `Bearer ${user.bearerToken}`)
        .then((res) => {
          if (res.body.length === 0) {
            return;
          }
          setVoltage(res.body[0].voltage);
          setPower(res.body[0].power);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    if (activeMeter) {
      console.log('set interval');
      fetchMeterData(activeMeter.id);
      intervalHandle.current = setInterval(() => {
        fetchMeterData(activeMeter.id);
      }, 1000 * 3);
    }

    return () => {
      clearInterval(intervalHandle.current);
    };
  }, [user, activeMeter]);

  useEffect(() => {
    if (!activeMeter) {
      return {};
    }
    superagent
      .get(`${EMC_METERS_V1}/meters/${activeMeter.id}/data`)
      .query({
        from: 0,
        to: Date.now(),
      })
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then((res) => {
        const voltages = [];
        const powers = [];
        const timestamps = [];
        res.body.forEach((item, idx) => {
          voltages.push(item.voltage.toFixed(2));
          powers.push(item.power.toFixed(2));
          timestamps.push(item.timestamp);

          if (item['__entity'] === 'ShortTermData' && waveletLastIdxRef.current < 0) {
            waveletLastIdxRef.current = idx - 1;
          }
        });
        setVoltageHistory(voltages);
        setPowerHistory(powers);
        setMeterTimestamps(timestamps);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      waveletLastIdxRef.current = -1;
    };
  }, [user, activeMeter]);

  // get predict data
  useEffect(() => {
    if (!activeMeter) {
      return;
    }
    superagent
      .get(`${EMC_METERS_V1}/meters/${activeMeter.id}/data/predict`)
      .query({
        count: predictCount,
      })
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then((res) => {
        const predictedPower = [];
        res.body.forEach((item) => {
          predictedPower.push({
            power: item.power.toFixed(2),
            timestamp: item.timestamp,
          });
        });
        setPredictData(predictedPower);
      })
      .catch((err) => {
        console.error(err);
        setPredictCount(0);
        setPredictData([]);
      });
  }, [user, activeMeter, powerHistory, predictCount]);

  const handlePredictCountChange = (event, newValue) => {
    setPredictCount(newValue === '' ? 0 : newValue);
  };

  const handleBlur = () => {
    if (predictCount < 0) {
      setPredictCount(0);
    } else if (predictCount > MAX_PREDICT_COUNT) {
      setPredictCount(MAX_PREDICT_COUNT);
    }
  };

  const handleInputChange = (event) => {
    setPredictCount(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleMeterChange = (event) => {
    const meterId = event.target.value;
    const meter = meters.find((item) => item.id === meterId);
    setActiveMeter(meter);
  };

  if (loadingMeters) {
    return (
      <Page title='Dashboard' sx={{ height: '100%' }}>
        <Container maxWidth='xl' sx={{ height: '100%' }}>
          <Typography variant='h4' sx={{ mb: 5 }}>
            Hi, Welcome back
          </Typography>

          <Grid
            container
            direction='column'
            alignItems='center'
            justifyContent='center'
            spacing={3}
            sx={{ height: '100%' }}
          >
            <Grid item>
              <CircularProgress size={100} />
            </Grid>
            <Grid item>
              <Typography variant='h2'>
                Loading meters...
              </Typography>
            </Grid>
          </Grid>

        </Container>
      </Page>
    );
  }

  if (!activeMeter) {
    return (
      <Page title='Dashboard' sx={{ height: '100%' }}>
        <Container maxWidth='xl' sx={{ height: '100%' }}>
          <Typography variant='h4' sx={{ mb: 5 }}>
            Hi, Welcome back
          </Typography>

          <Grid container sx={{ justifyContent: 'center', alignContent: 'center', height: '100%' }} spacing={3}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant='h2' sx={{ mb: 10 }}>
                Please pair a meter with your account to continue
              </Typography>
            </Grid>
          </Grid>

        </Container>
      </Page>
    );
  }

  return (
    <Page title='Dashboard'>
      <Container maxWidth='xl'>
        <Grid container sx={{ justifyContent: 'space-between' }} spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant='h4' sx={{ mb: 5 }}>
              Hi, Welcome back
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} md={3}>
            <FormControl fullWidth>
              <InputLabel>Meter</InputLabel>
              <Select
                labelId='select-meter'
                value={activeMeter ? activeMeter.id : ''}
                label='Meter'
                onChange={handleMeterChange}
              >
                {
                  meters.map((meter) => (
                    <MenuItem key={meter.id} value={meter.id}>{meter.name || meter.serialNumber}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title='Voltage, V'
              total={voltage}
              color={voltage > 240 ? 'error' : 'info'}
              icon={'eva:activity-outline'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title='Power, W/h'
              total={power}
              color={power > 200 ? 'error' : 'info'}
              icon={'eva:flash-outline'}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            {powerHistory && <AppPowerUsage
              title='Power'
              subheader=''
              fill={{
                type: 'gradient',
                gradient: {
                  shade: 'dark',
                  // gradientToColors: ['#d11336', '#46d113'],
                  shadeIntensity: 1,
                  type: 'vertical',
                  opacityFrom: 1,
                  opacityTo: 1,
                  // stops: [0, 1, 2],
                  colorStops: [
                    {
                      offset: 10,
                      color: '#fc440b',
                      opacity: 1,
                    },
                    {
                      offset: 55,
                      color: '#46d113',
                      opacity: 1,
                    },
                    {
                      offset: 90,
                      color: '#2065D1',
                      opacity: 1,
                    },
                  ],
                },
              }}
              predictDataCount={predictCount - 1}
              waveletLastIdx={waveletLastIdxRef.current}
              chartLabels={[...meterTimestamps, ...predictData.map((item) => item.timestamp)]}
              chartData={[
                {
                  name: 'power',
                  type: 'line',
                  data: [...powerHistory, ...predictData.map((item) => item.power)],
                },
              ]}
            />}
            <Box
              marginX={20}
              marginY={5}
            >
              <Typography gutterBottom>
                Predict for {predictCount} minutes
              </Typography>

              <Grid container spacing={2} alignItems='center'>
                <Grid item xs>
                  <Slider
                    value={predictCount}
                    min={0}
                    step={1}
                    max={MAX_PREDICT_COUNT}
                    onChange={handlePredictCountChange}
                  />
                </Grid>
                <Grid item>
                  <Input
                    value={predictCount}
                    size='small'
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    inputProps={{
                      min: 0,
                      max: MAX_PREDICT_COUNT,
                      type: 'number',
                      'aria-labelledby': 'input-slider',
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppVoltageUsage
              title='Voltage'
              subheader=''
              chartLabels={meterTimestamps}
              chartData={[
                {
                  name: 'voltage',
                  type: 'area',
                  fill: 'gradient',
                  color: theme.palette.chart.yellow[0],
                  data: voltageHistory,
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
