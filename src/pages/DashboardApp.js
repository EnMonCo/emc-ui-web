import { useEffect, useRef, useState } from 'react';
import superagent from 'superagent';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Typography } from '@mui/material';
// components
import Page from '../components/Page';
// sections
import { AppWebsiteVisits, AppWidgetSummary } from '../sections/@dashboard/app';

import { EMC_METERS_V1 } from '../config';
import useAuth from '../hooks/useAuth';
import AppVoltageUsage from '../sections/@dashboard/app/AppVoltageUsage';
import AppPowerUsage from '../sections/@dashboard/app/AppPowerUsage';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const theme = useTheme();

  const [meters, setMeters] = useState([]);

  const { getUser } = useAuth();

  const [voltage, setVoltage] = useState(0.0);
  const [power, setPower] = useState(0.0);
  const [activeMeter, setActiveMeter] = useState(null);
  const [voltageHistory, setVoltageHistory] = useState([]);
  const [powerHistory, setPowerHistory] = useState([]);
  const [meterTimestamps, setMeterTimestamps] = useState([]);

  const user = getUser();

  const fetchMeterData = (id) => {
    if (id) {
      superagent
        .get(`${EMC_METERS_V1}/meters/${id}/data/live`)
        .set('Authorization', `Bearer ${user.bearerToken}`)
        .then((res) => {
          setVoltage(res.body[0].voltage);
          setPower(res.body[0].power);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  useEffect(() => {
    superagent
      .get(`${EMC_METERS_V1}/users/${user.id}/meters`)
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then((res) => {
        setMeters(res.body.data);
        setActiveMeter(res.body.data[0]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [user]);

  const intervalHandle = useRef(null);

  useEffect(() => {
    if (activeMeter) {
      console.log('set interval');
      fetchMeterData(activeMeter.id);
      intervalHandle.current = setInterval(() => {
        fetchMeterData(activeMeter.id);
      }, 1000 * 10);
    }

    return () => {
      clearInterval(intervalHandle.current);
    };
  }, [activeMeter]);

  useEffect(() => {
    const date = new Date();
    if (activeMeter) {
      superagent
        .get(`${EMC_METERS_V1}/meters/${activeMeter.id}/data`)
        .query({
            from: 0,
            to: date.getTime(),
          }
        )
        .set('Authorization', `Bearer ${user.bearerToken}`)
        .then((res) => {
          const voltages = [];
          const powers = [];
          const timestamps = [];
          res.body.forEach((item) => {
            voltages.push(item.voltage.toFixed(2));
            powers.push(item.power.toFixed(2));
            timestamps.push(item.timestamp);
          });
          setVoltageHistory(voltages);
          setPowerHistory(powers);
          setMeterTimestamps(timestamps);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [user, activeMeter]);

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Voltage, V"
              total={voltage}
              color={voltage > 240 ? 'error' : 'info'}
              icon={'eva:activity-outline'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Power, kW/h"
              total={power}
              color={power > 0.5 ? 'error' : 'info'}
              icon={'eva:flash-outline'}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppPowerUsage
              title="Power"
              subheader=""
              chartLabels={meterTimestamps}
              chartData={[
                {
                  name: 'power',
                  type: 'area',
                  fill: 'gradient',
                  data: powerHistory,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppVoltageUsage
              title="Voltage"
              subheader=""
              chartLabels={meterTimestamps}
              chartData={[
                {
                  name: 'voltage',
                  type: 'area',
                  fill: 'gradient',
                  color: theme.palette.chart.yellow[0],
                  data: voltageHistory,
                }
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
