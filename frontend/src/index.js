import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import '@shopify/polaris/build/esm/styles.css';
import "https://cdn.shopify.com/shopifycloud/app-bridge.js";
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import ContextProvider from './providers/ContextProvider.jsx';
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider i18n={enTranslations}>
    <Router>
      <React.StrictMode>
        <ContextProvider>
          <App />
        </ContextProvider>
      </React.StrictMode>
    </Router>
  </AppProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
