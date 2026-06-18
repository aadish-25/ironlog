import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../services/api";

export function AxiosInterceptor() {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptorId = api.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Failed to get Clerk token", err);
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptorId);
    };
  }, [getToken]);

  return null;
}
