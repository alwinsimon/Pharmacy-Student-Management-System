/**
 * Main entry point for the application.
 * Sets up React with Redux and React Router.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { APP_INFO } from './utils/constants';

// Log application information
console.log(`%c${APP_INFO.NAME} v${APP_INFO.VERSION}`, 'font-weight: bold; font-size: 16px; color: #3f51b5;');
console.log(`${APP_INFO.DESCRIPTION}`);

// Create a root element for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 