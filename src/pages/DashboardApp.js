import { faker } from '@faker-js/faker';
import { useEffect, useState } from 'react';
import superagent from 'superagent';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppConversionRates,
  AppCurrentSubject,
  AppCurrentVisits,
  AppNewsUpdate,
  AppOrderTimeline,
  AppTasks,
  AppTrafficBySite,
  AppWebsiteVisits,
  AppWidgetSummary,
} from '../sections/@dashboard/app';

import { EMC_METERS_V1 } from '../config';
import useAuth from '../hooks/useAuth';


// ----------------------------------------------------------------------

export default function DashboardApp() {
  const theme = useTheme();

  const [meters, setMeters] = useState([]);

  const { getUser } = useAuth();

  const [voltage, setVoltage] = useState(0.0);
  const [power, setPower] = useState(0.0);

  const user = getUser();

  useEffect(() => {
    superagent
      .get(`${EMC_METERS_V1}/users/${user.id}/meters`)
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then((res) => {
        setMeters(res.body.data);
        fetchMeterData(res.body.data[0].id);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [user.bearerToken]);

  const fetchMeterData = (id) => {
    if(id) {
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
  }

  setInterval(()=>{
    if(meters.length)
    {
      fetchMeterData(meters[0].id);
    }
  }, 1000 * 10);



  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Voltage" total={voltage} color={voltage > 240 ? "error" : "info"} icon={'eva:activity-outline'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Power" total={power} color={power > 0.5 ? "error" : "info"} icon={'eva:flash-outline'} />
          </Grid>


          <Grid item xs={12} md={12} lg={12}>
            <AppWebsiteVisits
              title="Voltage"
              subheader=""
              chartLabels={[
                '2022-05-20T16:56:53.860Z',
                '2022-05-20T16:57:54.886Z',
                '2022-05-20T16:58:55.799Z',
                '2022-05-20T16:59:56.850Z',
                '2022-05-20T17:00:58.126Z',
                '2022-05-20T17:01:58.863Z',
                '2022-05-20T17:02:59.854Z',
                '2022-05-20T17:04:00.751Z',
                '2022-05-20T17:05:01.906Z',
                '2022-05-20T17:06:02.849Z',
                '2022-05-20T17:07:03.796Z',
              ]}
              chartData={[
                {
                  name: 'voltage',
                  type: 'area',
                  fill: 'gradient',
                  data: [230, 185, 220, 226, 189, 220, 208, 218, 224, 198, 228]
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppWebsiteVisits
              title="Voltage"
              subheader=""
              chartLabels={[
                '2022-05-20T16:56:53.860Z',
                '2022-05-20T16:57:54.886Z',
                '2022-05-20T16:58:55.799Z',
                '2022-05-20T16:59:56.850Z',
                '2022-05-20T17:00:58.126Z',
                '2022-05-20T17:01:58.863Z',
                '2022-05-20T17:02:59.854Z',
                '2022-05-20T17:04:00.751Z',
                '2022-05-20T17:05:01.906Z',
                '2022-05-20T17:06:02.849Z',
                '2022-05-20T17:07:03.796Z',
              ]}
              chartData={[
                {
                  name: 'voltage',
                  type: 'area',
                  fill: 'gradient',
                  data: [230, 185, 220, 226, 189, 220, 208, 218, 224, 198, 228]
                }
              ]}
            />
          </Grid>
          
        </Grid>
      </Container>
    </Page>
  );
}
