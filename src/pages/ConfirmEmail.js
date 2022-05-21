import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import superagent from 'superagent';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import { EMC_ACCOUNTS_V1 } from '../config';

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

export default function ConfirmEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { hash } = useParams();

  const handleLogin = () => {
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setIsLoading(true);
    superagent
      .post(`${EMC_ACCOUNTS_V1}/auth/email/confirm`)
      .send({ hash })
      .then(() => {
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setError(e);
      });
  }, [hash]);

  if (error) {
    return (
      <Page title="Confirmation Aborted">
        <Container>
          <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Iconify icon="eva:close-circle-outline" sx={{ width: 160, height: 160, color: 'red' }} />
            <Typography variant="h4">Confirmation failed</Typography>
            <Typography variant="body1">
              The confirmation link is invalid or has expired. Please try again.
            </Typography>
          </ContentStyle>
        </Container>
      </Page>
    );
  }

  return isLoading ? (
    <Page title="Confirm Email">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h4">Confirmation in progress</Typography>
          <Box sx={{ width: '100%' }}>
            <CircularProgress />
          </Box>
        </ContentStyle>
      </Container>
    </Page>
  ) : (
    <Page title="Confirm Email">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Iconify icon="eva:checkmark-circle-2-outline" sx={{ width: 160, height: 160, color: 'green' }} />
          <Typography variant="h4">Confirmation successful</Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: '1rem',
            }}
          >
            You can now login to your account.
          </Typography>
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
