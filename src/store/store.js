import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import api from '../core/api/axios';
import { setupInterceptors } from '../core/api/interceptor';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Turn off serialization warning for easier payload transitions if needed
    }),
});

setupInterceptors(api, store);

export default store;
