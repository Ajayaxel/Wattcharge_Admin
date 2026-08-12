import { logoutAdmin } from '../../features/auth/authSlice';

/**
 * Set up request/response interceptors for the Axios client.
 * Adds dynamic authorization headers using stored bearer JWT tokens.
 */
export const setupInterceptors = (axiosInstance, store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Global response interceptor for handling 401s or other network errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized state, logging out and clearing token
        console.warn('Unauthorized request detected. Session expired.');
        if (store) {
          store.dispatch(logoutAdmin());
        }
      }
      return Promise.reject(error);
    }
  );
};
