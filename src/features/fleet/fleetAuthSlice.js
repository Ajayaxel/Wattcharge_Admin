import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../core/api/axios';
import { ENDPOINTS } from '../../core/api/endpoints';

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('fleet_user')); } catch { return null; }
})();

const initialState = {
  isAuthenticated: !!localStorage.getItem('fleet_token'),
  user: storedUser,       // { _id, name, email, role, fleetCompanyId }
  token: localStorage.getItem('fleet_token') || null,
  isLoading: false,
  error: null,
};

// Async thunk — logs in via the shared admin/login endpoint
export const loginFleetAdmin = createAsyncThunk(
  'fleetAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      if (response.data?.success) {
        const { token, user } = response.data.data;

        // Only allow fleet_admin through this portal
        if (user.role !== 'fleet_admin') {
          return rejectWithValue('Access denied. This portal is for fleet admins only.');
        }

        localStorage.setItem('fleet_token', token);
        localStorage.setItem('fleet_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data?.message || 'Login failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid credentials.');
    }
  }
);

const fleetAuthSlice = createSlice({
  name: 'fleetAuth',
  initialState,
  reducers: {
    logoutFleetAdmin: (state) => {
      localStorage.removeItem('fleet_token');
      localStorage.removeItem('fleet_user');
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearFleetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginFleetAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginFleetAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginFleetAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutFleetAdmin, clearFleetError } = fleetAuthSlice.actions;
export default fleetAuthSlice.reducer;
