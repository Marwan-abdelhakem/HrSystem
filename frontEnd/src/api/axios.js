import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    withCredentials: true, // send cookies (httpOnly tokens)
});

/**
 * Attach the Bearer token from the store to every request.
 * The backend reads it from the `authorization` header.
 */
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.authorization = token;
    }
    return config;
});

/**
 * Global 401 handler — clear session and redirect to login.
 */
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
