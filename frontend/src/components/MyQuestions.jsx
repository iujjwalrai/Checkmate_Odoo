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

  // Initial load and when filters/page change
  useEffect(() => {
    console.log('MyQuestions: useEffect triggered', { filters, page });
    fetchMyQuestions();
  }, [filters, page]);

  // Refresh data when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('MyQuestions: Window focus detected, refreshing...');
      fetchMyQuestions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Force refresh when component mounts or location changes
  useEffect(() => {
    console.log('MyQuestions: Component mounted or location changed, fetching questions...');
    fetchMyQuestions();
  }, [location.pathname]);

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('MyQuestions: No token found for username fetch');
        return;
      }
      
      console.log('MyQuestions: Fetching username from:', `${API}/api/users/profile`);
      const response = await axios.get(`${API}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('MyQuestions: Username response:', response.data);
      setUsername(response.data.username);
      console.log('MyQuestions: Username set to:', response.data.username);
    } catch (error) {
      console.error('MyQuestions: Error fetching username:', error);
      console.error('MyQuestions: Error response:', error.response?.data);
      console.error('MyQuestions: Error status:', error.response?.status);
      
      // Fallback: Try to get username from localStorage if available
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        console.log('MyQuestions: Using stored username as fallback:', storedUsername);
        setUsername(storedUsername);
      }
    }
  };

  const fetchMyQuestions = async () => {
    try {
      console.log('MyQuestions: Starting fetch...');
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('MyQuestions: No token found, redirecting to login');
        navigate('/');
        return;
      }

      // Fetch username and questions in parallel
      await Promise.all([fetchUsername(), fetchQuestionsData()]);
    } catch (error) {
      console.error('MyQuestions: Error in fetch:', error);
    } finally {
      setLoading(false);
      console.log('MyQuestions: Fetch completed');
    }
  };

  const fetchQuestionsData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('MyQuestions: Making API request to:', `${API}/api/questions/my-questions`);
      const response = await axios.get(`${API}/api/questions/my-questions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters, page }
      });
      
      console.log('MyQuestions: API response:', response.data);
      setQuestions(response.data.questions);
      console.log('MyQuestions: Questions set:', response.data.questions.length);
    } catch (error) {
      console.error('MyQuestions: Error fetching questions:', error);
      console.error('MyQuestions: Error response:', error.response?.data);
      console.error('MyQuestions: Error status:', error.response?.status);
    }
  };

  const handleSortChange = (sortType) => {
    setFilters({ ...filters, sort: sortType });
    setPage(1);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading your questions...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Questions</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-600">Welcome back,</p>
                  {username ? (
                    <span className="text-indigo-600 font-semibold text-lg">@{username}</span>
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
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🌍 Explore Community
              </button>
              <button
                onClick={() => navigate('/ask')}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Answers</p>
                <p className="text-2xl font-bold text-gray-900">{questions.reduce((sum, q) => sum + (q.answerCount || 0), 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{questions.reduce((sum, q) => sum + (q.voteCount || 0), 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sort Questions</h3>
            <button
              onClick={fetchMyQuestions}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSortChange('newest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.sort === 'newest' 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => handleSortChange('oldest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.sort === 'oldest' 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => handleSortChange('votes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.sort === 'votes' 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Voted
            </button>
            <button
              onClick={() => handleSortChange('views')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.sort === 'views' 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Viewed
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-8xl mb-6">🤔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No questions yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your journey by asking your first question and help others in the community!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/ask')}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                ✨ Ask Your First Question
              </button>
              <button
                onClick={() => navigate('/questions')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                🌍 Explore Community
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <VoteButton id={question._id} type="question" voteCount={question.voteCount} />
                    <div className="flex-1">
                      <Link
                        to={`/questions/${question._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 block mb-3"
                      >
                        {question.title}
                      </Link>
                      <div className="text-gray-600 mb-4 line-clamp-2 max-h-32 overflow-hidden question-preview">
                        <div dangerouslySetInnerHTML={{ __html: question.description }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {question.answerCount || 0} answers
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {question.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            {question.voteCount || 0} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/questions/${question._id}/edit`}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-2 mt-4">
                          {question.tags.map((tag) => (
                            <span
                              key={tag._id || tag}
                              className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium"
                            >
                              {tag.name || tag}
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