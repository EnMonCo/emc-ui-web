import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import superagent from 'superagent';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import { EMC_ACCOUNTS_V1, EMC_METERS_V1 } from '../config';
import useAuth from '../hooks/useAuth';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function PairMeter() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { hash } = useParams();
  const {getUser} = useAuth();

  const user = getUser();

  const handleHome = () => {
    navigate('/dashboard/app', { replace: true });
  };

  useEffect(() => {
    setIsLoading(true);
    superagent
      .post(`${EMC_METERS_V1}/users/${user.id}/meters/${hash}/pair`)
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then(() => {
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setError(e);
      });
  }, [hash, user]);

  if (error) {
    return (
      <Page title="Pairing Aborted">
        <Container>
          <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Iconify icon="eva:close-circle-outline" sx={{ width: 160, height: 160, color: 'red' }} />
            <Typography variant="h4">Pairing failed</Typography>
            <Typography variant="body1">
              Pairing link is invalid or has expired. Please, reset meter and try again.
            </Typography>
          </ContentStyle>
        </Container>
      </Page>
    );
  }

  return isLoading ? (
    <Page title="Pairing Meter">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h4">Pairing</Typography>
          <Box sx={{ width: '100%' }}>
            <CircularProgress />
          </Box>
        </ContentStyle>
      </Container>
    </Page>
  ) : (
    <Page title="Pairing Meter">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Iconify icon="eva:checkmark-circle-2-outline" sx={{ width: 160, height: 160, color: 'green' }} />
          <Typography variant="h4">Pairing successful</Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: '1rem',
            }}
          >
            You successfully added new meter to your account.
          </Typography>
          <Button variant="contained" onClick={handleHome}>
            Home
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
