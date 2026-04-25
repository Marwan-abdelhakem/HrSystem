import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

const ROLE_BADGE = {
    Admin: "badge-error",
    HR: "badge-warning",
    Employee: "badge-success",
};

export default function Navbar({ onMenuClick }) {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch {
            // ignore — clear locally regardless
        } finally {
            clearAuth();
            navigate("/login");
        }
    };

    const initials = user?.user_name
        ? user.user_name.slice(0, 2).toUpperCase()
        : "??";

    return (
        <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left: hamburger + brand */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="btn btn-ghost btn-sm btn-square lg:hidden"
                        aria-label="Toggle menu"
                    >
                        <Menu size={20} />
                    </button>

                    <span className="text-lg font-bold text-primary tracking-tight select-none">
                        HR<span className="text-slate-700">System</span>
                    </span>
                </div>

                {/* Right: notifications + user menu */}
                <div className="flex items-center gap-2">
                    {/* Notification bell */}
                    <button className="btn btn-ghost btn-sm btn-square relative" aria-label="Notifications">
                        <Bell size={18} className="text-slate-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    </button>

                    {/* User dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50
                         transition-colors duration-150 focus:outline-none"
                        >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center
                              justify-center text-xs font-bold select-none">
                                {initials}
                            </div>

                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                                    {user?.user_name}
                                </span>
                                <span className={`badge badge-sm ${ROLE_BADGE[user?.role] ?? "badge-ghost"}`}>
                                    {user?.role}
                                </span>
                            </div>

                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Dropdown panel */}
                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg
                             border border-slate-100 py-1 z-50"
                                >
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500
                               hover:bg-red-50 transition-colors duration-150"
                                    >
                                        <LogOut size={15} />
                                        Sign out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
