import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout Components
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import AlertContainer from './components/common/AlertContainer'

// Pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import TaskBoard from './pages/TaskBoard/TaskBoard'
import TeamManagement from './pages/TeamManagement/TeamManagement'
import Profile from './pages/Profile/Profile'
import NotFound from './pages/NotFound'
import TeamMemberManagement from './pages/TeamManagement/TeamMemberManagement'


function App() {
  const { isAuthenticated, loading, checkAuth } = useAuth();

  useEffect(() => {
    // Check if user is authenticated on app load
    checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="loading-spinner" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  // Public route - redirects to dashboard if already logged in
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="loading-spinner" />
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertContainer />

      {isAuthenticated && !loading && (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header />
            <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" />}
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
                  path="/tasks/:teamId"
                  element={
                    <ProtectedRoute>
                      <TaskBoard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute>
                      <TeamManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId/members"
                  element={
                    <ProtectedRoute>
                      <TeamMemberManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      )}

      {!isAuthenticated && !loading && (
        <div className="flex items-center justify-center min-h-screen">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
