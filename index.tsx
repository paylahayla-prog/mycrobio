import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApiConfigProvider } from './contexts/ApiConfigContext';
import { LanguageProvider } from './contexts/LanguageContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ApiConfigProvider>
        <App />
      </ApiConfigProvider>
    </LanguageProvider>
  </React.StrictMode>
);
