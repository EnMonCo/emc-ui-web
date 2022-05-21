import { Navigate, Route, Routes } from 'react-router-dom';
// layouts
import { Typography } from '@mui/material';
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Blog from './pages/Blog';
import User from './pages/User';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import Products from './pages/Products';
import DashboardApp from './pages/DashboardApp';
import RequireAuth from "./components/RequireAuth";

// ----------------------------------------------------------------------

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<LogoOnlyLayout />}>
        <Route index element={<Navigate to="/dashboard/app" />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="oauth-callback" element={<Typography>Logging you in...</Typography>} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Route>
      <Route path="/dashboard" element={
        <RequireAuth>
          <DashboardLayout />
        </RequireAuth>
      }>
        <Route path="app" element={<DashboardApp />} />
        <Route path="user" element={<User />} />
        <Route path="products" element={<Products />} />
        <Route path="blog" element={<Blog />} />
      </Route>
    </Routes>
  );
}
