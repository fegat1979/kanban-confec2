// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { ErrorBoundary } from "./ErrorBoundary";

// ✅ importe o provider
import { UIProvider } from "./store/uiContext";

const container = document.getElementById("root");
if (!container) throw new Error("Elemento #root não encontrado no index.html");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        {/* ✅ agora o App fica dentro do UIProvider */}
        <UIProvider>
          <App />
        </UIProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
