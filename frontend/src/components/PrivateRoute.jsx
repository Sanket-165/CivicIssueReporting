import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ component: Component, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  // This handles the brief moment when the app is loading the user state from localStorage
  // It prevents a flicker to the login page on a refresh.
  if (user === undefined) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent h-12 w-12" />
        <p className="mt-4 text-text-secondary">Authenticating...</p>
      </div>
    );
  }
  
  // If user is not logged in, redirect to the login page.
  // We pass the original location so they can be redirected back after logging in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // This is the key logic upgrade.
  // It checks if the required role is in a set of allowed roles for the user.
  // e.g., A 'superadmin' is allowed on an 'admin' route.
  const userHasRequiredRole = () => {
    if (user.role === 'superadmin') {
      return ['admin', 'superadmin'].includes(role);
    }
    return user.role === role;
  };

  // If a role is required and the user doesn't have it, redirect them to the home page.
  if (role && !userHasRequiredRole()) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the requested component.
  return <Component />;
};

export default PrivateRoute;
