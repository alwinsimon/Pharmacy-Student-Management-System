import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testService } from '../../services/api';

// Get all tests
export const getAllTests = createAsyncThunk(
  'tests/getAllTests',
  async (_, thunkAPI) => {
    try {
      const response = await testService.getAllTests();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get test by ID
export const getTestById = createAsyncThunk(
  'tests/getTestById',
  async (id, thunkAPI) => {
    try {
      const response = await testService.getTestById(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create new test
export const createTest = createAsyncThunk(
  'tests/createTest',
  async (testData, thunkAPI) => {
    try {
      const response = await testService.createTest(testData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update test
export const updateTest = createAsyncThunk(
  'tests/updateTest',
  async ({ id, testData }, thunkAPI) => {
    try {
      const response = await testService.updateTest(id, testData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get test questions
export const getTestQuestions = createAsyncThunk(
  'tests/getTestQuestions',
  async (id, thunkAPI) => {
    try {
      const response = await testService.getTestQuestions(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Start test
export const startTest = createAsyncThunk(
  'tests/startTest',
  async (id, thunkAPI) => {
    try {
      const response = await testService.startTest(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Submit test
export const submitTest = createAsyncThunk(
  'tests/submitTest',
  async ({ id, answers }, thunkAPI) => {
    try {
      const response = await testService.submitTest(id, answers);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get test results
export const getTestResults = createAsyncThunk(
  'tests/getTestResults',
  async (id, thunkAPI) => {
    try {
      const response = await testService.getTestResults(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get class results
export const getClassResults = createAsyncThunk(
  'tests/getClassResults',
  async (id, thunkAPI) => {
    try {
      const response = await testService.getClassResults(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  tests: [],
  currentTest: null,
  testQuestions: [],
  activeTest: null,
  testResults: null,
  classResults: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    resetTestState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentTest: (state) => {
      state.currentTest = null;
      state.testQuestions = [];
      state.activeTest = null;
      state.testResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all tests
      .addCase(getAllTests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tests = action.payload;
      })
      .addCase(getAllTests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get test by ID
      .addCase(getTestById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTest = action.payload;
      })
      .addCase(getTestById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create test
      .addCase(createTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tests.push(action.payload);
        state.currentTest = action.payload;
      })
      .addCase(createTest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update test
      .addCase(updateTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.tests.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(updateTest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get test questions
      .addCase(getTestQuestions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTestQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.testQuestions = action.payload;
      })
      .addCase(getTestQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Start test
      .addCase(startTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeTest = action.payload;
      })
      .addCase(startTest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Submit test
      .addCase(submitTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.testResults = action.payload;
        state.activeTest = null;
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get test results
      .addCase(getTestResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTestResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.testResults = action.payload;
      })
      .addCase(getTestResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get class results
      .addCase(getClassResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClassResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.classResults = action.payload;
      })
      .addCase(getClassResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetTestState, clearCurrentTest } = testsSlice.actions;
export default testsSlice.reducer; 