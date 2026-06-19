import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ui } from "@clerk/ui";
import App from "./App";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-expect-error - ui prop required by Clerk warning but types are outdated */}
    <ClerkProvider publishableKey={publishableKey} ui={ui}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);