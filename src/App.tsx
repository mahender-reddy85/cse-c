import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Shell } from './components/layout/Shell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Browse } from './pages/Browse';
import { Search } from './pages/Search';
import { Requests } from './pages/Requests';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Shell>
                <Dashboard />
              </Shell>
            </ProtectedRoute>
          } />

          <Route path="/browse" element={
            <ProtectedRoute>
              <Shell>
                <Browse />
              </Shell>
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <Shell>
                <Search />
              </Shell>
            </ProtectedRoute>
          } />

          <Route path="/requests" element={
            <ProtectedRoute>
              <Shell>
                <Requests />
              </Shell>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Shell>
                <Admin />
              </Shell>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
