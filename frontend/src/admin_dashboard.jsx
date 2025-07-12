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
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold text-center text-indigo-600 mb-10"
      >
        Admin Dashboard
      </motion.h1>

      {message && (
        <div className="mb-6 text-center text-red-600 font-semibold">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Panel */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">👥 All Users</h2>
          <ul className="divide-y divide-gray-200">
            {users
              .filter((user) => user.role !== 'admin')
              .map((user) => (
                <li key={user._id} className="py-2">
                  <strong>{user.username}</strong> – {user.email} <br />
                  <span className="text-sm text-gray-500">Role: {user.role}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Questions Panel */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-indigo-600">❓ All Questions</h2>
          <ul className="divide-y divide-gray-200">
            {questions.map((q) => (
              <li key={q._id} className="py-3 flex justify-between items-start">
                <div>
                  <p className="font-medium">{q.title}</p>
                  <p className="text-sm text-gray-500">
                    By: {q.author?.username || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="ml-4 px-3 py-1 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
