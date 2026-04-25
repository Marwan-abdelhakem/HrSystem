import useAuthStore from "../store/authStore";

/**
 * Convenience hook — exposes the auth store with a clean API.
 * Use this instead of importing useAuthStore directly in components.
 */
export const useAuth = () => {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);
    const setAuth = useAuthStore((s) => s.setAuth);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const isAuthenticated = Boolean(token && user);
    const isAdmin = user?.role === "Admin";
    const isHR = user?.role === "HR";
    const isEmployee = user?.role === "Employee";

    return { token, user, setAuth, clearAuth, isAuthenticated, isAdmin, isHR, isEmployee };
};

export default useAuth;
