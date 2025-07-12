import React from 'react';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <div className="text-center mt-10 text-red-600">You must be logged in to access this page.</div>;
}