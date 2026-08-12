import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
});

export default rootReducer;
