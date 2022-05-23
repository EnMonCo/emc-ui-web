import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CircularProgress, Container, Stack, Typography } from '@mui/material';
import superagent from 'superagent';
import Page from '../components/Page';
import { EMC_ACCOUNTS_V1 } from '../config';
import useAuth from '../hooks/useAuth';

export default function User() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const {getUser} = useAuth();

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


  return (

    <Page title="User">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            User
          </Typography>
        </Stack>
      </Container>
      <Card>
        {user ? (
          <>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.email}
            </Typography>
          </>
        ) : (
          <CircularProgress />
        )}
      </Card>
    </Page>
  );
}
