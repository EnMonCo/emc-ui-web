import { Avatar, Button, Container, Grid, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import superagent from 'superagent';
import Page from '../components/Page';
import useAuth from '../hooks/useAuth';
import { EMC_ACCOUNTS_V1 } from '../config';
import User from '../entities/User';

export default function SettingsApp() {
  const { getUser, login } = useAuth();

  const [isEdited, setIsEdited] = useState(false);

  const EditSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!'),
    lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!'),
  });

  const user = getUser();

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    validationSchema: EditSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        const response = await superagent
          .patch(`${EMC_ACCOUNTS_V1}/auth/me`)
          .set('Authorization', `Bearer ${user.bearerToken}`)
          .send(values);
        const updatedUser = new User({
          ...user,
          ...response.body,
        });
        login(updatedUser);
        formikHelpers.setSubmitting(false);
        setIsEdited(false);
      } catch (error) {
        console.error(error);
        formikHelpers.setSubmitting(false);
        setIsEdited(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <Page title="Settings">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Your profile
        </Typography>

        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xl={4}>
                <Grid container sx={{ flexDirection: 'column' }} spacing={2}>
                  <Grid item>
                    <Grid container>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="First name"
                          {...getFieldProps('firstName')}
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
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
                          label="Last name"
                          {...getFieldProps('lastName')}
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
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
                          defaultValue={user.email}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                {isEdited ? (
                  <LoadingButton
                    fullWidth
                    size="large"
                    sx={{ marginTop: '1rem' }}
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    Save
                  </LoadingButton>
                ) : (
                  <Button
                    fullWidth
                    size="large"
                    sx={{ marginTop: '1rem' }}
                    variant="contained"
                    onClick={() => setIsEdited(true)}
                  >
                    Edit profile
                  </Button>
                )}
              </Grid>
              <Grid item xl={8} display={'flex'}>
                <Avatar
                  variant="circular"
                  sx={{ height: '225px', width: '225px' }}
                  src={user.photo || '/static/mock-images/avatars/avatar_default.jpg'}
                />
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </Container>
    </Page>
  );
}
