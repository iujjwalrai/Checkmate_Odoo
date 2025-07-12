import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import VoteButton from './VoteButton';
import Notifications from './Notifications';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

export default function MyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMyQuestions();
  }, [filters, page]);

  useEffect(() => {
    const handleFocus = () => {
      fetchMyQuestions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    fetchMyQuestions();
  }, [location.pathname]);

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsername(response.data.username);
    } catch (error) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  };

  const fetchMyQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      await Promise.all([fetchUsername(), fetchQuestionsData()]);
    } catch (error) {
      console.error('Error in fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/questions/my-questions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters, page }
      });

      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSortChange = (sortType) => {
    setFilters({ ...filters, sort: sortType });
    setPage(1);
  };

  if (loading) {
    return <div className="p-4 text-center text-lg">Loading your questions...</div>;
  }
// ... [Imports remain unchanged]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 font-sans text-gray-800"> {/* 🌟 DESIGN UPGRADE */}
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md hover:shadow-xl transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Questions</h1> {/* 🌟 DESIGN UPGRADE */}
                <div className="flex items-center gap-2 mt-1 text-base font-medium">
                  <p className="text-gray-600">Welcome back,</p>
                  {username ? (
                    <span className="text-indigo-700 font-semibold">@{username}</span>
                  ) : (
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Notifications />
              <button
                onClick={() => navigate('/questions')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                🌍 Explore Community
              </button>
              <button
                onClick={() => navigate('/ask')}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                ✨ Ask Question
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Questions', count: questions.length, color: 'blue', iconPath: 'M8.228 9c.549-1.165...' },
            { label: 'Total Answers', count: questions.reduce((sum, q) => sum + (q.answerCount || 0), 0), color: 'green', iconPath: 'M9 12l2 2 4-4...' },
            { label: 'Total Votes', count: questions.reduce((sum, q) => sum + (q.voteCount || 0), 0), color: 'purple', iconPath: 'M7 11l5-5m0 0l5 5...' }
          ].map(({ label, count, color, iconPath }, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"> {/* 🌟 DESIGN UPGRADE */}
              <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                  <svg className={`w-6 h-6 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">{label}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{count}</p> {/* 🌟 DESIGN UPGRADE */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Sort Questions</h3>
            <button
              onClick={fetchMyQuestions}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['newest', 'oldest', 'votes', 'views'].map((type) => (
              <button
                key={type}
                onClick={() => handleSortChange(type)}
                className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  filters.sort === type
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Question List */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border p-12 text-center hover:shadow-2xl transition-transform duration-300 transform hover:scale-[1.01]">
            <div className="text-8xl mb-6">🤔</div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">No questions yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your journey by asking your first question and help others in the community!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/ask')}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-transform duration-300 shadow-md hover:shadow-xl font-semibold transform hover:scale-105"
              >
                ✨ Ask Your First Question
              </button>
              <button
                onClick={() => navigate('/questions')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-transform duration-300 shadow-md hover:shadow-xl font-semibold transform hover:scale-105"
              >
                🌍 Explore Community
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"> {/* 🌟 DESIGN UPGRADE */}
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <VoteButton id={question._id} type="question" voteCount={question.voteCount} />
                    <div className="flex-1">
                      <Link
                        to={`/questions/${question._id}`}
                        className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors duration-200 block mb-3 underline underline-offset-2 decoration-indigo-300 hover:decoration-indigo-500"
                      >
                        {question.title}
                      </Link>
                      <div className="text-gray-600 mb-4 line-clamp-2 max-h-32 overflow-hidden question-preview text-sm leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: question.description }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">💬 {question.answerCount || 0} answers</span>
                          <span className="flex items-center gap-1">👁️ {question.views || 0} views</span>
                          <span className="flex items-center gap-1">👍 {question.voteCount || 0} votes</span>
                          <span className="flex items-center gap-1">📅 {new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Link
                          to={`/questions/${question._id}/edit`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          ✏️ Edit
                        </Link>
                      </div>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {question.tags.map((tag) => (
                            <span
                              key={tag._id || tag}
                              className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold tracking-wide shadow-sm hover:shadow-md transition cursor-pointer"
                            >
                              #{tag.name || tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
