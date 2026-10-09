import axios from "axios";
import { Capacitor } from "@capacitor/core";

/**
 * Base URL determination:
 * - On Native Android (Capacitor): Relative paths like "/api" don't work because the app
 *   runs from the local asset scheme (`https://localhost` or `capacitor://localhost`).
 *   Therefore, it uses `VITE_API_URL` (pointing to production Vercel backend e.g. `https://ironlog-psi.vercel.app/api`),
 *   falling back to `http://localhost:5000/api` if testing locally via `adb reverse tcp:5000 tcp:5000`.
 * - On Web: Uses `VITE_API_URL` or relative `/api` (proxied by Vite in dev or Vercel rewrites in prod).
 */
const envUrl = import.meta.env.VITE_API_URL;
const baseURL = Capacitor.isNativePlatform()
    ? (envUrl && envUrl.startsWith("http") ? envUrl : "http://localhost:5000/api")
    : (envUrl || "/api");

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

export const fetcher = (url: string) => api.get(url).then(res => res.data.data);
