import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Theme Provider
import ThemeProvider from './components/ThemeProvider';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import GlobalLoader from './components/GlobalLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import NotFound from './pages/NotFound';

// Case-related pages
import CaseList from './pages/cases/CaseList';
import CaseForm from './pages/cases/CaseForm';
import CaseDetail from './pages/cases/CaseDetail';

// Query-related pages
import QueryList from './pages/queries/QueryList';
import QueryForm from './pages/queries/QueryForm';
import QueryDetail from './pages/queries/QueryDetail';

// Test-related pages
import TestList from './pages/tests/TestList';
import TestForm from './pages/tests/TestForm';
import TestDetail from './pages/tests/TestDetail';
import TakeTest from './pages/tests/TakeTest';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Redux
import { setUser, clearUser } from './features/auth/authSlice';
import { initializeSocket } from './services/socketService';
import jwtDecode from 'jwt-decode';
import { STORAGE_KEYS } from './utils/constants';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          dispatch(clearUser());
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        } else {
          // Valid token, set user
          const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
          dispatch(setUser(userData));
          
          // Initialize socket connection
          initializeSocket(token, dispatch);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        dispatch(clearUser());
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
  }, [dispatch]);
  
  // Determine if current route is public
  const isPublicRoute = ['/login', '/register', '/'].includes(location.pathname);
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Global notifications and loader */}
          <Notification />
          <GlobalLoader />
          
          {/* Header is shown on all pages */}
          <Header />
          
          {/* Main content */}
          <Box component="main" sx={{ 
            flexGrow: 1, 
            pt: isPublicRoute ? 0 : 8,
            mt: isPublicRoute ? 0 : 0
          }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes - Require authentication */}
              <Route element={<ProtectedRoute isAllowed={!!user} redirectPath="/login" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<HelpCenter />} />
                
                {/* Cases */}
                <Route path="/cases" element={<CaseList />} />
                <Route path="/cases/new" element={<CaseForm />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/cases/:id/edit" element={<CaseForm />} />
                
                {/* Queries */}
                <Route path="/queries" element={<QueryList />} />
                <Route path="/queries/new" element={<QueryForm />} />
                <Route path="/queries/:id" element={<QueryDetail />} />
                <Route path="/queries/:id/edit" element={<QueryForm />} />
                
                {/* Tests */}
                <Route path="/tests" element={<TestList />} />
                <Route path="/tests/new" element={<TestForm />} />
                <Route path="/tests/:id" element={<TestDetail />} />
                <Route path="/tests/:id/edit" element={<TestForm />} />
                <Route path="/tests/:id/take" element={<TakeTest />} />
                
                {/* Admin routes - Require admin role */}
                <Route element={<ProtectedRoute isAllowed={user?.role === 'admin'} redirectPath="/dashboard" />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
          
          {/* Footer is shown on all pages */}
          <Footer />
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Protected Route component
const ProtectedRoute = ({ isAllowed, redirectPath, children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children : <Outlet />;
};

export default App; 