import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ui } from "@clerk/ui";
import { SWRConfig } from "swr";
import { fetcher } from "./services/api";
import App from "./App";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function localStorageProvider() {
  const STORAGE_KEY = "ironlog_swr_cache";
  let map: Map<string, any>;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    map = new Map(raw ? JSON.parse(raw) : []);
  } catch {
    map = new Map();
  }

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  const syncToStorage = () => {
    try {
      const serializable: [string, any][] = [];
      for (const [k, v] of map.entries()) {
        if (typeof k === "string" && !k.startsWith("$") && v && v.data !== undefined) {
          serializable.push([k, v]);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // ignore storage quota errors
    }
  };

  const originalSet = map.set.bind(map);
  map.set = (key: any, value: any) => {
    const result = originalSet(key, value);
    if (typeof key === "string" && !key.startsWith("$")) {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(syncToStorage, 800);
    }
    return result;
  };

  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      syncToStorage();
    }
  });

  window.addEventListener("beforeunload", syncToStorage);

  return map;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-expect-error - ui prop required by Clerk warning but types are outdated */}
    <ClerkProvider publishableKey={publishableKey} ui={ui}>
      <SWRConfig
        value={{
          provider: localStorageProvider,
          fetcher,
          dedupingInterval: 5 * 60 * 1000,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          revalidateIfStale: false,
        }}
      >
        <App />
      </SWRConfig>
    </ClerkProvider>
  </React.StrictMode>
);