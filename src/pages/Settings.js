import { useTheme } from '@mui/material/styles';

import { Avatar, Button, Container, Grid, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import Page from '../components/Page';

export default function SettingsApp() {
  const theme = useTheme();

  const [isEdited, setIsEdited] = useState(false);
  const [name, setName] = useState('Nikita');
  const [surname, setSurname] = useState('Nesterov');

  const handleNameChange = (event) => {
    event.preventDefault();
    event.persist();
    setName(event.target.value);
  };

  const handleSurnameChange = (event) => {
    event.preventDefault();
    event.persist();
    setSurname(event.target.value);
  };

  return (
    <Page title="Settings">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Your profile
        </Typography>
        <Grid container spacing={4}>
          <Grid item xl={4}>
            <Grid container sx={{ flexDirection: 'column' }} spacing={2}>
              <Grid item>
                <Grid container>
                  <Grid item xs={12}>
                    <TextField
                      label="Name"
                      fullWidth
                      value={name}
                      onChange={handleNameChange}
                      InputProps={{
                        readOnly: !isEdited,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Surname"
                      value={surname}
                      onChange={handleSurnameChange}
                      InputProps={{
                        readOnly: !isEdited,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      fullWidth
                      defaultValue="example@gmail.com"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Button size="large" sx={{ marginTop: 1 }} onClick={() => setIsEdited(!isEdited)}>
              {isEdited ? 'Save' : 'Edit profile'}
            </Button>
          </Grid>
          <Grid item xl={8} display={'flex'}>
            <Avatar variant="circular" sx={{ height: '225px', width: '225px' }} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
