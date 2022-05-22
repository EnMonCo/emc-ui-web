import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export default function RequireAdmin({ children }) {
  const { getUser } = useAuth();
  const user = getUser();
  if (user.role.id !== 1) {
    return <Navigate to="/404" replace />;
  }
  return children;
}

RequireAdmin.propTypes = {
  children: PropTypes.node,
};
