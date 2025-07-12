import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [message, setMessage] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.from) {
      const fromPath = location.state.from.pathname;
      if (fromPath === '/ask') {
        setRedirectMessage('Please register or login to ask questions');
      } else if (fromPath === '/my-questions') {
        setRedirectMessage('Please register or login to view your questions');
      } else if (fromPath === '/my-activity') {
        setRedirectMessage('Please register or login to view your activity');
      } else if (fromPath.includes('/questions/') && fromPath.includes('/answer')) {
        setRedirectMessage('Please register or login to answer questions');
      } else {
        setRedirectMessage('Please register or login to access this feature');
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';
      const url = isLogin ? `${baseUrl}/api/auth/login` : `${baseUrl}/api/auth/register`;
      const { data } = await axios.post(url, form);

      setMessage(data.message);
      localStorage.setItem('token', data.token);
      if (data.user && data.user.username) {
        localStorage.setItem('username', data.user.username);
      }

      // ✅ Redirect based on role
      if (data.user && data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/my-questions');
      }
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center mb-8">
        <motion.h1
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-white text-6xl font-extrabold mb-4 shadow-lg"
        >
          Stack<span className="text-yellow-300">It</span>
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="text-white/90 text-xl font-medium"
        >
          Your Q&A Community Platform
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back!' : 'Join Our Community'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
          </p>
          {redirectMessage && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-center text-sm text-blue-600">{redirectMessage}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            {isLogin ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-center text-sm text-red-600">{message}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
            >
              {isLogin ? 'Register here' : 'Sign in here'}
            </button>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Want to explore first?</p>
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              👀 Browse as Guest
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
