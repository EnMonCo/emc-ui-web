import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Box, Card, CircularProgress, Container, Stack, Typography } from '@mui/material';
import superagent from 'superagent';
import { sentenceCase } from 'change-case';
import Page from '../components/Page';
import { EMC_ACCOUNTS_V1 } from '../config';
import useAuth from '../hooks/useAuth';
import UserMetersTable from '../components/UserMetersTable';
import Label from '../components/Label';
import Iconify from '../components/Iconify';

export default function User() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { getUser } = useAuth();

  const admin = getUser();

  useEffect(() => {
    superagent
      .get(`${EMC_ACCOUNTS_V1}/users/${id}`)
      .set('Authorization', `Bearer ${admin.bearerToken}`)
      .then((res) => {
        setUser(res.body);
      })
      .catch((err) => {
        console.error(err);
        if (err.status === 404) {
          navigate('/404', { replace: true });
        }
      });
  }, [admin, id, navigate]);

  const title = user ? `${user.firstName} ${user.lastName}` : 'Loading...';

  if (!user) {
    return (
      <Page title={title}>
        <Container>
          <CircularProgress />
        </Container>
      </Page>
    );
  }

  return (
    <Page title={title}>
      <Container>
        <Card>
          <Stack direction="row" spacing={4} padding="3rem">
            <Avatar
              variant="circular"
              sx={{ height: '225px', width: '225px' }}
              src={user.photo || '/static/mock-images/avatars/avatar_default.jpg'}
            />
            <Box>
              <Stack direction="row" spacing={1} mb={2}>
                {user.id === admin.id && (
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    (you)
                  </Typography>
                )}
                <Typography variant="h5">
                  {user.firstName} {user.lastName}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} mb={1} alignItems='center'>
                <Iconify icon="eva:email-outline" width={22} height={22} />
                <Typography variant="body1">{user.email}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} mb={1} alignItems='center'>
                <Iconify icon="eva:info-outline" width={22} height={22} />
                <Typography variant="body1">Status:</Typography>
                <Label variant="ghost" color={(user.status.id === 2 && 'error') || 'success'}>
                  {sentenceCase(user.status.name)}
                </Label>
              </Stack>

              <Stack direction="row" spacing={1} mb={1} alignItems='center'>
                <Iconify icon="eva:person-outline" width={22} height={22} />
                <Typography variant="body1">Role: </Typography>
                <Label variant="ghost" color={(user.role.id === 2 && 'info') || 'success'}>
                  {sentenceCase(user.role.name)}
                </Label>
              </Stack>

              <Stack direction="row" spacing={1} mb={1} alignItems='center'>
                <Iconify icon="eva:calendar-outline" width={22} height={22} />
                <Typography variant="body1">Registered at {new Date(user.createdAt).toLocaleString()}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Container>

      <Box sx={{ m: 3 }} />

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} mt={4}>
          <Typography variant="h4" gutterBottom>
            Meters
          </Typography>
        </Stack>
        <UserMetersTable forUserId={user.id} />
      </Container>
    </Page>
  );
}
