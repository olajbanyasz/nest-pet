import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { LoadingProvider } from './contexts/LoadingProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </React.StrictMode>,
);
