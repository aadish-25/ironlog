import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

export const fetcher = (url: string) => api.get(url).then(res => res.data);
