import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * Wraps routes that require authentication.
 * Optionally restricts to specific roles via the `roles` prop.
 *
 * Usage:
 *   <ProtectedRoute />                        — any authenticated user
 *   <ProtectedRoute roles={["Admin"]} />      — Admin only
 */
const ProtectedRoute = ({ roles }) => {
    const { token, user } = useAuthStore();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
