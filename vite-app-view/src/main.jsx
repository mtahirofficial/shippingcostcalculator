import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@shopify/polaris/build/esm/styles.css";
import "https://cdn.shopify.com/shopifycloud/app-bridge.js";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import ContextProvider from "./providers/ContextProvider.jsx";
import { BrowserRouter as Router } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <AppProvider i18n={enTranslations}>
    <Router>
      <StrictMode>
        <ContextProvider>
          <App />
        </ContextProvider>
      </StrictMode>
    </Router>
  </AppProvider>,
);

if (typeof window !== "undefined" && "PerformanceObserver" in window) {
  let lastLcpEntry = null;

  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) lastLcpEntry = lastEntry;
  });

  lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

  const reportLcp = () => {
    if (!lastLcpEntry) return;
    const lcpValue = lastLcpEntry.startTime;
    // console.log('Final LCP (ms):', Math.round(lcpValue), lastLcpEntry)
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      reportLcp();
    }
  });

  window.addEventListener("pagehide", reportLcp);
}
