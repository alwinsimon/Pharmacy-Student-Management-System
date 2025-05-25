import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '../features/auth/authSlice';
import socketReducer from '../features/socket/socketSlice';
import casesReducer from '../features/cases/casesSlice';
import queriesReducer from '../features/queries/queriesSlice';
import testsReducer from '../features/tests/testsSlice';
import uiReducer from '../features/ui/uiSlice';

/**
 * Creates a test store with the provided preloadedState
 * @param {Object} preloadedState - Initial state for the store
 * @returns {Object} Redux store instance
 */
export function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      auth: authReducer,
      socket: socketReducer,
      cases: casesReducer,
      queries: queriesReducer,
      tests: testsReducer,
      ui: uiReducer,
    },
    preloadedState,
  });
}

/**
 * Custom render function that includes Redux provider and Router
 * @param {JSX.Element} ui - The component to render
 * @param {Object} options - Render options including initialState and store
 * @returns {Object} Result of render
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
} 