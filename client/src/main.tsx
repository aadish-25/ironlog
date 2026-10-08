import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ui } from "@clerk/ui";
import { SWRConfig } from "swr";
import { fetcher } from "./services/api";
import App from "./App";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-expect-error - ui prop required by Clerk warning but types are outdated */}
    <ClerkProvider publishableKey={publishableKey} ui={ui}>
      <SWRConfig
        value={{
          fetcher,
          dedupingInterval: 2000,
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          revalidateIfStale: true,
        }}
      >
        <App />
      </SWRConfig>
    </ClerkProvider>
  </React.StrictMode>
);