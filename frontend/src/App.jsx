import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import QuizResults from './pages/QuizResults';
import Home from './pages/Home';
import ConceptMapPage from './pages/ConceptMapPage';
import TeacherDashboard from './pages/TeacherDashboard';
import CollaborativeStudy from './pages/CollaborativeStudy';
import SpacedRepetition from './pages/SpacedRepetition';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role === 'admin') return <Navigate to="/admin-dashboard" />;
  
  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check both authentication and admin role
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

// Public Route component (redirect to dashboard or admin-dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return user?.role === 'admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/dashboard" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-results"
        element={
          <ProtectedRoute>
            <QuizResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/concept-map"
        element={
          <ProtectedRoute>
            <ConceptMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborative"
        element={
          <ProtectedRoute>
            <CollaborativeStudy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spaced-repetition"
        element={
          <ProtectedRoute>
            <SpacedRepetition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
        <UIProvider>
          <AppRoutes />
        </UIProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
