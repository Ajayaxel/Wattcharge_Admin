import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../core/api/axios';
import { ENDPOINTS } from '../../core/api/endpoints';

const initialState = {
  users: [],
  isLoading: false,
  userSearchQuery: '',
  toast: null,
};

const mockUsers = [
  {
    _id: 'user_1',
    name: 'Ajay',
    email: 'ajay@wattcharge.com',
    phoneNumber: '9555238994',
    role: 'admin',
    isActive: true,
    createdAt: '2026-06-18T10:00:00.000Z',
  },
  {
    _id: 'user_2',
    name: 'John Doe',
    email: 'john@gmail.com',
    phoneNumber: '9876543210',
    role: 'user',
    isActive: true,
    createdAt: '2026-06-19T11:00:00.000Z',
  },
  {
    _id: 'user_3',
    name: 'Rahul Dev',
    email: 'rahul@gmail.com',
    phoneNumber: '9988112233',
    role: 'user',
    isActive: false,
    createdAt: '2026-06-19T12:00:00.000Z',
  }
];

export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth.isDemoMode) {
      return { data: mockUsers, source: 'demo' };
    }
    try {
      const response = await api.get(ENDPOINTS.AUTH.USERS);
      if (response.data && response.data.success) {
        return { data: response.data.data || [], source: 'live' };
      }
      return rejectWithValue(response.data?.message || 'Failed to fetch users');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Network/Server Error');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setUserSearchQuery: (state, action) => {
      state.userSearchQuery = action.payload;
    },
    showToastNotification: (state, action) => {
      state.toast = action.payload;
    },
    clearToastNotification: (state) => {
      state.toast = null;
    },
    loadDemoData: (state) => {
      state.users = mockUsers;
    },
    clearDashboardData: (state) => {
      state.users = [];
      state.userSearchQuery = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.toast = { message: action.payload || 'Failed to fetch users.', isError: true };
        if (state.users.length === 0) {
          state.users = mockUsers;
        }
      });
  }
});

export const {
  setUserSearchQuery,
  showToastNotification,
  clearToastNotification,
  loadDemoData,
  clearDashboardData
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
