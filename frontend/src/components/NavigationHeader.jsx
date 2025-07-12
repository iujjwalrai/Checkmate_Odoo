import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Notifications from './Notifications';

export default function NavigationHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setIsAuthenticated(!!token);
    setUsername(storedUsername || '');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    navigate('/');
  };

  // Don't show header on the main login/register page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigate('/questions')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StackIt</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/questions')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Questions
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/my-questions')}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  My Questions
                </button>
                <button
                  onClick={() => navigate('/my-activity')}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  My Activity
                </button>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Notifications />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Welcome, @{username}</span>
                  <button
                    onClick={() => navigate('/ask')}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                  >
                    Ask Question
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Browsing as guest</span>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                >
                  Join Community
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 