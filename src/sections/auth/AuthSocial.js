import OAuth2Login from 'react-simple-oauth2-login';
import { useState } from 'react';
// import superagent from 'superagent';
// material
import { Button, Stack } from '@mui/material';
// component
import Iconify from '../../components/Iconify';
import { APP_URL } from '../../config';

// ----------------------------------------------------------------------

const onFailure = (response) => console.error(response);

export default function AuthSocial() {
  const [loading, setLoading] = useState(null);

  const handleGoogleLogin = async (response) => {
    console.log(response);

    setLoading('google');

    // await superagent
    //   .post(`${process.env.REACT_APP_BACKEND_URL}/emc-accounts/api/v1/auth/google/login`)
    //   .send({})

    setLoading(null);
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <OAuth2Login
          authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth"
          responseType="code"
          clientId="723416872724-f7lilmc6m2ipamkm94mi7e9ble8il95k.apps.googleusercontent.com"
          redirectUri={`${APP_URL}/oauth-callback`}
          render={(props) => (
            // eslint-disable-next-line react/prop-types
            <Button fullWidth size="large" color="inherit" variant="outlined" onClick={props.onClick}>
              <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
            </Button>
          )}
          scope={
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid'
          }
          onSuccess={handleGoogleLogin}
          onFailure={onFailure}
          onRequest={() => setLoading('google')}
          isCrossOrigin
        />

        <OAuth2Login
          authorizationUrl="https://www.facebook.com/v13.0/dialog/oauth"
          responseType="code"
          clientId="735518507622887"
          redirectUri={`${APP_URL}/oauth-callback`}
          render={(props) => (
            // eslint-disable-next-line react/prop-types
            <Button fullWidth size="large" color="inherit" variant="outlined" onClick={props.onClick}>
              <Iconify icon="eva:facebook-fill" color="#1877F2" width={22} height={22} />
            </Button>
          )}
          scope={'public_profile email'}
          onSuccess={console.log}
          onFailure={onFailure}
          onRequest={() => setLoading('facebook')}
          isCrossOrigin
        />

        <OAuth2Login
          authorizationUrl="https://twitter.com/i/oauth2/authorize"
          responseType="code"
          clientId="NUI5TnVHaG1PVDk2dm50NUNJRy06MTpjaQ"
          redirectUri={`${APP_URL}/oauth-callback`}
          render={(props) => (
            // eslint-disable-next-line react/prop-types
            <Button fullWidth size="large" color="inherit" variant="outlined" onClick={props.onClick}>
              <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={22} height={22} />
            </Button>
          )}
          scope={'users.read'}
          onSuccess={console.log}
          onFailure={onFailure}
          onRequest={() => setLoading('twitter')}
          extraParams={{
            state: 'state',
            code_challenge: 'challenge',
            code_challenge_method: 'plain',
          }}
          isCrossOrigin
        />
      </Stack>
    </>
  );
}
