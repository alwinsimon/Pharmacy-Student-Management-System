import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { io } from 'socket.io-client';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/cases/CaseList';
import CaseForm from './pages/cases/CaseForm';
import CaseDetail from './pages/cases/CaseDetail';
import QueryList from './pages/queries/QueryList';
import QueryForm from './pages/queries/QueryForm';
import QueryDetail from './pages/queries/QueryDetail';
import TestList from './pages/tests/TestList';
import TestForm from './pages/tests/TestForm';
import TestDetail from './pages/tests/TestDetail';
import TakeTest from './pages/tests/TakeTest';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

// Import components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Notification from './components/Notification';
import GlobalLoader from './components/GlobalLoader';

// Import theme and styles
import theme from './theme';

// Import redux actions
import { setUser, clearUser } from './features/auth/authSlice';
import { setSocket } from './features/socket/socketSlice';
import { setupSocketListeners } from './services/socketService';

const App = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  // Create a theme with user's preference
  const currentTheme = {
    ...theme,
    palette: {
      ...theme.palette,
      mode: darkMode ? 'dark' : 'light',
    },
  };

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      dispatch(setUser({ token: storedToken, user: JSON.parse(storedUser) }));
    } else {
      dispatch(clearUser());
    }
  }, [dispatch]);

  useEffect(() => {
    // Set up socket connection if user is logged in
    if (token && user) {
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
      });

      socket.on('connect', () => {
        console.log('Connected to socket server');
        dispatch(setSocket(socket));
        
        // Set up socket event listeners
        setupSocketListeners(socket, dispatch);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, user, dispatch]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <GlobalLoader />
        <Notification />
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/cases">
              <Route index element={
                <ProtectedRoute>
                  <CaseList />
                </ProtectedRoute>
              } />
              <Route path="new" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CaseForm />
                </ProtectedRoute>
              } />
              <Route path=":id" element={
                <ProtectedRoute>
                  <CaseDetail />
                </ProtectedRoute>
              } />
              <Route path=":id/edit" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CaseForm />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="/queries">
              <Route index element={
                <ProtectedRoute>
                  <QueryList />
                </ProtectedRoute>
              } />
              <Route path="new" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <QueryForm />
                </ProtectedRoute>
              } />
              <Route path=":id" element={
                <ProtectedRoute>
                  <QueryDetail />
                </ProtectedRoute>
              } />
              <Route path=":id/edit" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <QueryForm />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="/tests">
              <Route index element={
                <ProtectedRoute>
                  <TestList />
                </ProtectedRoute>
              } />
              <Route path="new" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TestForm />
                </ProtectedRoute>
              } />
              <Route path=":id" element={
                <ProtectedRoute>
                  <TestDetail />
                </ProtectedRoute>
              } />
              <Route path=":id/edit" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TestForm />
                </ProtectedRoute>
              } />
              <Route path=":id/take" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TakeTest />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App; 