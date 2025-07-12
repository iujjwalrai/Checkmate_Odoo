import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import VoteButton from './VoteButton';
import Notifications from './Notifications';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

export default function MyActivity() {
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyActivity();
  }, [page]);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API}/api/questions/my-activity`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page }
      });
      
      setActivity(response.data.activity);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching my activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivity = activeTab === 'all' 
    ? activity 
    : activity.filter(item => 
        activeTab === 'questions' ? item.title : item.content
      );

  if (loading) {
    return <div className="p-4 text-center">Loading your activity...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Activity</h2>
        <div className="flex gap-2">
          <Notifications />
          <button
            onClick={() => navigate('/ask')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Ask Question
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalQuestions || 0}</div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalAnswers || 0}</div>
            <div className="text-sm text-gray-600">Answers Given</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalActivity || 0}</div>
            <div className="text-sm text-gray-600">Total Activity</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Activity ({activity.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'questions'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions ({activity.filter(item => item.title).length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'answers'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Answers ({activity.filter(item => item.content).length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {filteredActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No activity yet</h3>
              <p className="text-gray-500 mb-4">Start by asking a question or answering one!</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/ask')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Ask Question
                </button>
                <button
                  onClick={() => navigate('/questions')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Browse Questions
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivity.map((item) => (
                <div key={item._id} className="border-b pb-4">
                  <div className="flex items-start gap-4">
                    <VoteButton 
                      id={item._id} 
                      type={item.title ? 'question' : 'answer'} 
                      voteCount={item.voteCount} 
                    />
                    <div className="flex-1">
                      {item.title ? (
                        // Question
                        <div>
                          <Link
                            to={`/questions/${item._id}`}
                            className="text-lg font-semibold text-indigo-600 hover:underline block mb-2"
                          >
                            {item.title}
                          </Link>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                              Question
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{item.answerCount || 0} answers</span>
                            <span>{item.views || 0} views</span>
                            <span>{item.voteCount || 0} votes</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : (
                        // Answer
                        <div>
                          <Link
                            to={`/questions/${item.question._id}`}
                            className="text-lg font-semibold text-indigo-600 hover:underline block mb-2"
                          >
                            {item.question.title}
                          </Link>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Answer
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2 line-clamp-2 max-h-16 overflow-hidden answer-content">
                            <div dangerouslySetInnerHTML={{ __html: item.content }} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{item.voteCount || 0} votes</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 