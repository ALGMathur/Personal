import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return <Loading message="Redirecting to login..." />;
  }

  return children;
};

export default ProtectedRoute;