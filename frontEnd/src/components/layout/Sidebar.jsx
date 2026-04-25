import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    CalendarCheck,
    FileText,
    CheckSquare,
    Clock,
    PlusCircle,
    ScrollText,
    BarChart3,
    X,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

// ─── Role-based nav config ────────────────────────────────────────────────────

const NAV_CONFIG = {
    Admin: [
        { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
        { label: "User Management", to: "/admin/users", icon: Users },
        { label: "Global Reports", to: "/admin/reports", icon: BarChart3 },
        { label: "System Logs", to: "/admin/logs", icon: ScrollText },
    ],
    HR: [
        { label: "Dashboard", to: "/hr", icon: LayoutDashboard },
        { label: "Employee List", to: "/hr/employees", icon: Users },
        { label: "Attendance", to: "/hr/attendance", icon: CalendarCheck },
        { label: "Leave Requests", to: "/hr/leave", icon: FileText },
        { label: "Task Assignment", to: "/hr/tasks", icon: ClipboardList },
    ],
    Employee: [
        { label: "Dashboard", to: "/employee", icon: LayoutDashboard },
        { label: "My Tasks", to: "/employee/tasks", icon: CheckSquare },
        { label: "My Requests", to: "/employee/requests", icon: FileText },
        { label: "New Request", to: "/employee/request", icon: PlusCircle },
        { label: "My Attendance", to: "/employee/attendance", icon: Clock },
    ],
};

// ─── Animation variants ───────────────────────────────────────────────────────

const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ onClose }) {
    const { user } = useAuthStore();
    const links = NAV_CONFIG[user?.role] ?? [];

    return (
        <div className="h-full bg-white border-r border-slate-100 flex flex-col py-5 px-3">
            {/* Mobile close button */}
            {onClose && (
                <div className="flex justify-end mb-2 lg:hidden">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Role label */}
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-4 mb-3">
                {user?.role} Menu
            </p>

            {/* Nav links */}
            <motion.nav
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1"
            >
                {links.map(({ label, to, icon: Icon }) => (
                    <motion.div key={to} variants={itemVariants}>
                        <NavLink
                            to={to}
                            end
                            onClick={onClose}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? "nav-link-active" : ""}`
                            }
                        >
                            <Icon size={17} className="shrink-0" />
                            {label}
                        </NavLink>
                    </motion.div>
                ))}
            </motion.nav>

            {/* Spacer + version */}
            <div className="mt-auto px-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-300 select-none">v1.0.0</p>
            </div>
        </div>
    );
}
