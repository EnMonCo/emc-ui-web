import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Box, Card, CircularProgress, Container, Stack, Typography } from '@mui/material';
import superagent from 'superagent';
import Page from '../components/Page';
import { EMC_ACCOUNTS_V1 } from '../config';
import useAuth from '../hooks/useAuth';

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

  return (
    <Page title={title}>
      <Container>
        <Card>
          {user ? (
            <Stack direction="row" spacing={4} padding="3rem">
              <Avatar
                variant="circular"
                sx={{ height: '225px', width: '225px' }}
                src={user.photo || '/static/mock-images/avatars/avatar_default.jpg'}
              />
              <Box>
                <Typography variant="h5" gutterBottom>
                  {user.firstName} {user.lastName} | EMC Profile
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.email}
                </Typography>

                <Typography variant="body1" gutterBottom>
                  Registered {new Date(user.createdAt).format('MMMM Do, YYYY')}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <CircularProgress />
          )}
        </Card>
      </Container>
    </Page>
  );
}
