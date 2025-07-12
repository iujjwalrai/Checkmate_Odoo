import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function GuestRoute({ children, requireAuth = false }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If authentication is required and user is not logged in, redirect to register
  if (requireAuth && !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
} 