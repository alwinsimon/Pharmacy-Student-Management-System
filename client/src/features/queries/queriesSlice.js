import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { queryService } from '../../services/api';

// Get all queries
export const getAllQueries = createAsyncThunk(
  'queries/getAllQueries',
  async (_, thunkAPI) => {
    try {
      const response = await queryService.getAllQueries();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get query by ID
export const getQueryById = createAsyncThunk(
  'queries/getQueryById',
  async (id, thunkAPI) => {
    try {
      const response = await queryService.getQueryById(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create new query
export const createQuery = createAsyncThunk(
  'queries/createQuery',
  async (queryData, thunkAPI) => {
    try {
      const response = await queryService.createQuery(queryData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update query
export const updateQuery = createAsyncThunk(
  'queries/updateQuery',
  async ({ id, queryData }, thunkAPI) => {
    try {
      const response = await queryService.updateQuery(id, queryData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Assign query to students
export const assignQuery = createAsyncThunk(
  'queries/assignQuery',
  async ({ id, studentIds }, thunkAPI) => {
    try {
      const response = await queryService.assignQuery(id, studentIds);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Respond to query
export const respondToQuery = createAsyncThunk(
  'queries/respondToQuery',
  async ({ id, response }, thunkAPI) => {
    try {
      const apiResponse = await queryService.respondToQuery(id, response);
      return apiResponse.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Evaluate response
export const evaluateResponse = createAsyncThunk(
  'queries/evaluateResponse',
  async ({ id, evaluation }, thunkAPI) => {
    try {
      const response = await queryService.evaluateResponse(id, evaluation);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  queries: [],
  currentQuery: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const queriesSlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    resetQueryState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentQuery: (state) => {
      state.currentQuery = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all queries
      .addCase(getAllQueries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllQueries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.queries = action.payload;
      })
      .addCase(getAllQueries.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get query by ID
      .addCase(getQueryById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQueryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentQuery = action.payload;
      })
      .addCase(getQueryById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create query
      .addCase(createQuery.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.queries.push(action.payload);
        state.currentQuery = action.payload;
      })
      .addCase(createQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update query
      .addCase(updateQuery.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.queries.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.queries[index] = action.payload;
        }
        state.currentQuery = action.payload;
      })
      .addCase(updateQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Assign query
      .addCase(assignQuery.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(assignQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.queries.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.queries[index] = action.payload;
        }
        state.currentQuery = action.payload;
      })
      .addCase(assignQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Respond to query
      .addCase(respondToQuery.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(respondToQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.queries.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.queries[index] = action.payload;
        }
        state.currentQuery = action.payload;
      })
      .addCase(respondToQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Evaluate response
      .addCase(evaluateResponse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(evaluateResponse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.queries.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.queries[index] = action.payload;
        }
        state.currentQuery = action.payload;
      })
      .addCase(evaluateResponse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetQueryState, clearCurrentQuery } = queriesSlice.actions;
export default queriesSlice.reducer; 