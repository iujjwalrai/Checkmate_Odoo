import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { QuestionList } from './components/QuestionList';
import QuestionDetails from './components/QuestionDetails';
import AskQuestion from './components/AskQuestion';
import MyQuestions from './components/MyQuestions';
import MyActivity from './components/MyActivity';
import UserProfile from './components/UserProfile';
import PrivateRoute from './components/PrivateRoute';
import GuestRoute from './components/GuestRoute';
import NavigationHeader from './components/NavigationHeader';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavigationHeader />
        <Routes>
          {/* Always show login/register page at "/" */}
          <Route path="/" element={<App />} />

          {/* Guest Access: Questions Feed - Anyone can view */}
          <Route
            path="/questions"
            element={
              <GuestRoute>
                <QuestionList />
              </GuestRoute>
            }
          />

          {/* Guest Access: Question Details - Anyone can view */}
          <Route
            path="/questions/:id"
            element={
              <GuestRoute>
                <QuestionDetails />
              </GuestRoute>
            }
          />

          {/* Protected: Ask Question - Requires authentication */}
          <Route
            path="/ask"
            element={
              <GuestRoute requireAuth={true}>
                <AskQuestion />
              </GuestRoute>
            }
          />

          {/* Protected: My Questions - Requires authentication */}
          <Route
            path="/my-questions"
            element={
              <GuestRoute requireAuth={true}>
                <MyQuestions />
              </GuestRoute>
            }
          />

          {/* Protected: My Activity - Requires authentication */}
          <Route
            path="/my-activity"
            element={
              <GuestRoute requireAuth={true}>
                <MyActivity />
              </GuestRoute>
            }
          />

          {/* Guest Access: User Profile - Anyone can view */}
          <Route
            path="/profile/:username"
            element={
              <GuestRoute>
                <UserProfile />
              </GuestRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
