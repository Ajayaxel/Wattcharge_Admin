import React from 'react';
import { Provider } from 'react-redux';
import store from '../store/store';

/**
 * Global App Providers component.
 * Wraps children with Redux state store providers.
 */
export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
