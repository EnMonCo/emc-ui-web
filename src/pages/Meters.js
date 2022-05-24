// material
// components
import { Container, Stack, Typography } from '@mui/material';
import Page from '../components/Page';

import UserMetersTable from '../components/UserMetersTable';

export default function Meters() {
  return (
    <Page title="Meters">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Meters
          </Typography>
        </Stack>
        <UserMetersTable />
      </Container>
    </Page>
  );
}
