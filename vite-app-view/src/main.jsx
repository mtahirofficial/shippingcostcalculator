import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@shopify/polaris/build/esm/styles.css';
import "https://cdn.shopify.com/shopifycloud/app-bridge.js";
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import ContextProvider from './providers/ContextProvider.jsx';
import { BrowserRouter as Router } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <AppProvider i18n={enTranslations}>
    <Router>
      <StrictMode>
        <ContextProvider>
          <App />
        </ContextProvider>
      </StrictMode>
    </Router>
  </AppProvider>
)
