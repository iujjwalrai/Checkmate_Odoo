import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
// import Tiptap from './Tiptap'; // Rich text editor component
import TagSelector from './TagSelector'; // Multi-select tag input
import VoteButton from './VoteButton';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

// ------------------------- Question List -------------------------
export function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ search: '', tags: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is guest (no token)
    const token = localStorage.getItem('token');
    setIsGuest(!token);
    
    axios
      .get(`${API}/api/questions`, { params: { ...filters, page } })
      .then((res) => setQuestions(res.data.questions))
      .catch((err) => console.error(err));
  }, [filters, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Questions</h1>
          <p className="text-gray-600 mt-1">
            {isGuest ? 'Browse questions as a guest' : 'Explore questions from the community'}
          </p>
          {isGuest && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                👋 You're browsing as a guest. 
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-800 font-semibold ml-1 underline"
                >
                  Register or login
                </button>
                {' '}to ask questions, answer, and vote!
              </p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="block w-full pl-10 pr-3 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <VoteButton id={q._id} type="question" voteCount={q.voteCount} />
                  <div className="flex-1">
                    <Link
                      to={`/questions/${q._id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 block mb-3"
                    >
                      {q.title}
                    </Link>
                    <div className="text-gray-600 mb-4 line-clamp-2">
                      <div dangerouslySetInnerHTML={{ __html: q.description?.substring(0, 200) + '...' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {q.author?.username && (
                          <Link 
                            to={`/profile/${q.author.username}`}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {q.author.username}
                          </Link>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {q.answerCount || 0} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {q.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {q.tags.map((tag) => (
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
      </div>
    </div>
  );
}