import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Tiptap from './Tiptap';
import TagSelector from './TagSelector';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newQuestionId, setNewQuestionId] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API}/api/questions`,
        { title, description, tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewQuestionId(data.question._id);
      setShowSuccess(true);
      
      // Clear form
      setTitle('');
      setDescription('');
      setTags([]);
    } catch (err) {
      console.error(err);
      alert('Error creating question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border max-w-2xl w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Question Posted Successfully!</h2>
          <p className="text-gray-600 mb-8 text-lg">Your question has been created and is now visible to the community.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
            <button
              onClick={() => navigate(`/questions/${newQuestionId}`)}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              👁️ View Question
            </button>
            <button
              onClick={() => navigate('/my-questions')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              📋 My Questions
            </button>
            <button
              onClick={() => navigate('/my-activity')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              📊 My Activity
            </button>
            <button
              onClick={() => navigate('/questions')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              🌍 Explore Community
            </button>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => {
                setShowSuccess(false);
                setNewQuestionId(null);
              }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              ✨ Ask Another Question
            </button>
          </div>
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <button className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute bottom-16 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:scale-100 scale-95">
            <div className="bg-white rounded-xl shadow-xl border p-2 space-y-1 min-w-[200px]">
              <button
                onClick={() => navigate('/my-questions')}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Questions
              </button>
              
              <button
                onClick={() => navigate('/my-activity')}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                My Activity
              </button>
              
              <button
                onClick={() => navigate('/questions')}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
                <p className="text-gray-600 mt-1">Share your knowledge and help others in the community</p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/my-questions')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                title="My Questions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">My Questions</span>
              </button>
              
              <button
                onClick={() => navigate('/my-activity')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                title="My Activity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">My Activity</span>
              </button>
              
              <button
                onClick={() => navigate('/questions')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                title="Explore Community"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Explore Community</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Question Title</label>
              <input 
                type="text" 
                placeholder="What's your question? Be specific..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400" 
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Question Details</label>
              <Tiptap 
                content={description} 
                setContent={setDescription} 
                placeholder="Provide more context about your question. You can include code examples, error messages, or any relevant details..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tags</label>
              <TagSelector selected={tags} setSelected={setTags} />
            </div>
            
            <div className="pt-6">
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Question...
                  </span>
                ) : (
                  '✨ Submit Question'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
