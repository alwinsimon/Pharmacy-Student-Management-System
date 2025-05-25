import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { caseService } from '../../services/api';

// Get all cases
export const getAllCases = createAsyncThunk(
  'cases/getAllCases',
  async (_, thunkAPI) => {
    try {
      const response = await caseService.getAllCases();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get case by ID
export const getCaseById = createAsyncThunk(
  'cases/getCaseById',
  async (id, thunkAPI) => {
    try {
      const response = await caseService.getCaseById(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create new case
export const createCase = createAsyncThunk(
  'cases/createCase',
  async (caseData, thunkAPI) => {
    try {
      const response = await caseService.createCase(caseData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update case
export const updateCase = createAsyncThunk(
  'cases/updateCase',
  async ({ id, caseData }, thunkAPI) => {
    try {
      const response = await caseService.updateCase(id, caseData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Submit case for evaluation
export const submitCase = createAsyncThunk(
  'cases/submitCase',
  async (id, thunkAPI) => {
    try {
      const response = await caseService.submitCase(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Evaluate a case
export const evaluateCase = createAsyncThunk(
  'cases/evaluateCase',
  async ({ id, evaluation }, thunkAPI) => {
    try {
      const response = await caseService.evaluateCase(id, evaluation);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add comment to a case
export const addComment = createAsyncThunk(
  'cases/addComment',
  async ({ id, comment }, thunkAPI) => {
    try {
      const response = await caseService.addComment(id, comment);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  cases: [],
  currentCase: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    resetCaseState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentCase: (state) => {
      state.currentCase = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all cases
      .addCase(getAllCases.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCases.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cases = action.payload;
      })
      .addCase(getAllCases.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get case by ID
      .addCase(getCaseById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCaseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentCase = action.payload;
      })
      .addCase(getCaseById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create case
      .addCase(createCase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cases.push(action.payload);
        state.currentCase = action.payload;
      })
      .addCase(createCase.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update case
      .addCase(updateCase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.cases.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.cases[index] = action.payload;
        }
        state.currentCase = action.payload;
      })
      .addCase(updateCase.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Submit case
      .addCase(submitCase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.cases.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.cases[index] = action.payload;
        }
        state.currentCase = action.payload;
      })
      .addCase(submitCase.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Evaluate case
      .addCase(evaluateCase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(evaluateCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.cases.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.cases[index] = action.payload;
        }
        state.currentCase = action.payload;
      })
      .addCase(evaluateCase.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.currentCase = action.payload;
      });
  },
});

export const { resetCaseState, clearCurrentCase } = casesSlice.actions;
export default casesSlice.reducer; 