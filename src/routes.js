import { Navigate, Route, Routes } from 'react-router-dom';
// layouts
import { Typography } from '@mui/material';
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Users from './pages/Users';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import Settings from './pages/Settings';
import DashboardApp from './pages/DashboardApp';
import RequireAuth from './components/RequireAuth';
import ConfirmEmail from './pages/ConfirmEmail';
import PairMeter from './pages/PairMeter';
import RequireAdmin from './components/RequireAdmin';

// ----------------------------------------------------------------------

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<LogoOnlyLayout />}>
        <Route index element={<Navigate to="/dashboard/app" />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="oauth-callback" element={<Typography>Logging you in...</Typography>} />
        {/* <Route path="confirm-email" element={<Navigate to="/404" />}> */}
        {/*  <Route path=":hash" element={<ConfirmEmail />}/> */}
        {/* </Route> */}

        <Route path="confirm-email/:hash" element={<ConfirmEmail />} />
        <Route
          path="pair/:hash"
          element={
            <RequireAuth>
              <PairMeter />
            </RequireAuth>
          }
        />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Route>
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="app" element={<DashboardApp />} />
        <Route
          path="user"
          element={
            <RequireAdmin>
              <Users />
            </RequireAdmin>
          }
        />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
