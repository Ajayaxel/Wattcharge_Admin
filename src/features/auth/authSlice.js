import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../core/api/axios';
import { ENDPOINTS } from '../../core/api/endpoints';

const initialState = {
  isAuthenticated: !!localStorage.getItem('admin_token'),
  isDemoMode: localStorage.getItem('admin_demo') === 'true',
  isLoading: false,
  error: null,
};

// Async Thunk for live DB login
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      if (response.data && response.data.success) {
        const token = response.data.data?.token || response.data.token;
        localStorage.setItem('admin_token', token);
        localStorage.removeItem('admin_demo');
        return token;
      }
      return rejectWithValue(response.data?.message || 'Login failed');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid credentials or backend offline.';
      return rejectWithValue(errMsg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    enterDemoMode: (state) => {
      localStorage.setItem('admin_demo', 'true');
      localStorage.removeItem('admin_token');
      state.isDemoMode = true;
      state.isAuthenticated = false;
      state.error = null;
    },
    logoutAdmin: (state) => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_demo');
      state.isAuthenticated = false;
      state.isDemoMode = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isDemoMode = false;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { enterDemoMode, logoutAdmin, clearError } = authSlice.actions;
export default authSlice.reducer;
