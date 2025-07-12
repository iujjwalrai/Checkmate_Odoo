import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Tiptap from './Tiptap';
import VoteButton from './VoteButton';

const API = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000';

export default function QuestionDetails() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [content, setContent] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is guest (no token)
    const token = localStorage.getItem('token');
    setIsGuest(!token);
    
    axios.get(`${API}/api/questions/${id}`).then((res) => setQuestion(res.data));
    axios.get(`${API}/api/answers/question/${id}`).then((res) => setAnswers(res.data.answers));
  }, [id]);

  const submitAnswer = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API}/api/answers`, { questionId: id, content }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnswers((prev) => [data.answer, ...prev]);
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {question && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <div className="flex items-start gap-6">
                <VoteButton id={question._id} type="question" voteCount={question.voteCount} />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
                  <div className="text-gray-700 text-lg leading-relaxed question-preview" dangerouslySetInnerHTML={{ __html: question.description }} />
                </div>
              </div>
            </div>
          </>
        )}

        {isGuest ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Join to Answer</h3>
            <p className="text-gray-600 mb-6">You need to register or login to answer this question and vote on answers.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              🚀 Join Community
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Answer</h3>
            <Tiptap content={content} setContent={setContent} placeholder="Write your answer here..." />
            <button 
              onClick={submitAnswer} 
              className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              ✨ Post Answer
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Answers ({answers.length})</h3>
          {answers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No answers yet. Be the first to answer!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((ans) => (
                <div key={ans._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start gap-6">
                    <VoteButton id={ans._id} type="answer" voteCount={ans.voteCount} />
                    <div className="flex-1">
                      <div className="text-gray-700 leading-relaxed answer-content" dangerouslySetInnerHTML={{ __html: ans.content }} />
                      {ans.author && (
                        <div className="mt-4 text-sm text-gray-500">
                          Answered by {ans.author.username}
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