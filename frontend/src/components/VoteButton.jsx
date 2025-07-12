import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

export default function VoteButton({ id, type, voteCount }) {
  const [count, setCount] = useState(voteCount);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setCount(voteCount); // Keep count in sync with prop
  }, [voteCount]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsGuest(!token);
  }, []);

  const vote = async (voteType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login if user is not authenticated
        window.location.href = '/';
        return;
      }
      const { data } = await axios.post(`${API}/api/${type}s/${id}/vote`, { voteType }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCount(data.voteCount); // Always use backend's total
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        // Redirect to login if token is invalid
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={() => vote('upvote')} 
        className={`p-3 rounded-xl transition-all duration-200 ${
          isGuest 
            ? 'text-gray-400 cursor-not-allowed opacity-50' 
            : 'text-green-600 hover:bg-green-50 hover:scale-110'
        }`}
        title={isGuest ? "Login to vote" : "Upvote"}
        disabled={isGuest}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
        count > 0 ? 'text-green-600 bg-green-50' : count < 0 ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'
      }`}>
        {count}
      </span>
      <button 
        onClick={() => vote('downvote')} 
        className={`p-3 rounded-xl transition-all duration-200 ${
          isGuest 
            ? 'text-gray-400 cursor-not-allowed opacity-50' 
            : 'text-red-600 hover:bg-red-50 hover:scale-110'
        }`}
        title={isGuest ? "Login to vote" : "Downvote"}
        disabled={isGuest}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}