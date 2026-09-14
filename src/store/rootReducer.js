import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import fleetAuthReducer from '../features/fleet/fleetAuthSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  fleetAuth: fleetAuthReducer,
});

export default rootReducer;
