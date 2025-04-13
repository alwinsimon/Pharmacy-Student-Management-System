import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: {
    show: false,
    message: '',
    type: 'info', // 'error', 'warning', 'info', 'success'
    duration: 6000,
  },
  sidebarOpen: true,
  darkMode: false,
  loading: {
    global: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notification = {
        show: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 6000,
      };
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setLoading: (state, action) => {
      state.loading.global = action.payload;
    },
  },
});

export const {
  showNotification,
  hideNotification,
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer; 