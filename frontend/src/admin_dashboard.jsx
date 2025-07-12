import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchUsers();
    fetchQuestions();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      setMessage('Failed to fetch users');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data.questions);
    } catch (err) {
      setMessage('Failed to fetch questions');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questions.filter((q) => q._id !== id));
      setMessage('Question deleted successfully');
    } catch (err) {
      setMessage('Failed to delete question');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-white to-purple-50 p-10">
      <motion.h1
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-5xl font-extrabold text-center text-indigo-700 mb-12 tracking-wide drop-shadow-md"
      >
        Admin Dashboard
      </motion.h1>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 max-w-xl mx-auto text-center text-red-700 font-semibold bg-red-100 rounded-lg py-3 shadow-sm"
        >
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {/* Users Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white shadow-2xl rounded-2xl p-8 border border-indigo-200"
        >
          <h2 className="text-3xl font-semibold mb-6 text-purple-700 flex items-center gap-3">
            <span className="text-4xl">👥</span> All Users
          </h2>
          <ul className="divide-y divide-gray-300 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
            {users
              .filter((user) => user.role !== 'admin')
              .map((user) => (
                <li
                  key={user._id}
                  className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-indigo-50 rounded-md px-3 transition"
                >
                  <div>
                    <strong className="text-lg text-indigo-800">{user.username}</strong> –{' '}
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <span className="mt-1 sm:mt-0 text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full select-none">
                    Role: {user.role}
                  </span>
                </li>
              ))}
          </ul>
        </motion.div>

        {/* Questions Panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white shadow-2xl rounded-2xl p-8 border border-indigo-200"
        >
          <h2 className="text-3xl font-semibold mb-6 text-indigo-700 flex items-center gap-3">
            <span className="text-4xl">❓</span> All Questions
          </h2>
          <ul className="divide-y divide-gray-300 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
            {questions.map((q) => (
              <li
                key={q._id}
                className="py-4 flex justify-between items-start hover:bg-indigo-50 rounded-md px-3 transition"
              >
                <div>
                  <p className="font-semibold text-indigo-900 text-lg">{q.title}</p>
                  <p className="text-sm text-indigo-600 mt-1 italic">
                    By: {q.author?.username || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="ml-6 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  aria-label={`Delete question titled ${q.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
