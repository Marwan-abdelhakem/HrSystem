import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ROLE_HOME = {
    Admin: "/admin",
    HR: "/hr",
    Employee: "/employee",
};

/**
 * Redirects the user to their role-specific dashboard on first load.
 */
const RoleRedirect = () => {
    const { user } = useAuthStore();
    const destination = ROLE_HOME[user?.role] ?? "/login";
    return <Navigate to={destination} replace />;
};

export default RoleRedirect;
