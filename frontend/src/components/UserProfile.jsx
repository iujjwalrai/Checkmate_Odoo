import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch user profile
        const userResponse = await axios.get(`${API}/api/users/${username}`, { headers });
        setUser(userResponse.data.user);
        setStats(userResponse.data.stats);
        
        // Fetch user's recent questions
        const questionsResponse = await axios.get(`${API}/api/questions/user/${username}`, { headers });
        setRecentQuestions(questionsResponse.data.questions);
        
        // Fetch user's recent answers
        const answersResponse = await axios.get(`${API}/api/answers/user/${username}`, { headers });
        setRecentAnswers(answersResponse.data.answers);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  if (!user) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* User Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
            <p className="text-gray-600">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            {user.reputation && (
              <p className="text-sm text-gray-500">Reputation: {user.reputation}</p>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalQuestions || 0}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalAnswers || 0}</div>
            <div className="text-sm text-gray-600">Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalVotes || 0}</div>
            <div className="text-sm text-gray-600">Votes Received</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'questions'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions ({recentQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'answers'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Answers ({recentAnswers.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'questions' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Questions</h3>
              {recentQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No questions yet</p>
              ) : (
                <div className="space-y-4">
                  {recentQuestions.map((question) => (
                    <div key={question._id} className="border-b pb-4">
                      <Link
                        to={`/questions/${question._id}`}
                        className="text-lg font-medium text-indigo-600 hover:underline"
                      >
                        {question.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{question.answerCount || 0} answers</span>
                        <span>{question.views || 0} views</span>
                        <span>{question.voteCount || 0} votes</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'answers' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Answers</h3>
              {recentAnswers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No answers yet</p>
              ) : (
                <div className="space-y-4">
                  {recentAnswers.map((answer) => (
                    <div key={answer._id} className="border-b pb-4">
                      <Link
                        to={`/questions/${answer.question._id}`}
                        className="text-lg font-medium text-indigo-600 hover:underline"
                      >
                        {answer.question.title}
                      </Link>
                      <div className="mt-2 text-sm text-gray-600 line-clamp-2 max-h-16 overflow-hidden answer-content">
                        <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{answer.voteCount || 0} votes</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 