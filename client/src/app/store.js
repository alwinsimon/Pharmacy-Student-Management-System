import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import socketReducer from '../features/socket/socketSlice';
import casesReducer from '../features/cases/casesSlice';
import queriesReducer from '../features/queries/queriesSlice';
import testsReducer from '../features/tests/testsSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    cases: casesReducer,
    queries: queriesReducer,
    tests: testsReducer,
    ui: uiReducer,
  },
}); 