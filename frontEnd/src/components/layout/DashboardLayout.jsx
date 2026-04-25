import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {/* ── Sticky top navbar ─────────────────────────────────── */}
            <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />

            <div className="flex flex-1 overflow-hidden">
                {/* ── Desktop sidebar (always visible ≥ lg) ─────────── */}
                <aside className="hidden lg:flex flex-col w-64 shrink-0">
                    <Sidebar />
                </aside>

                {/* ── Mobile sidebar (drawer) ────────────────────────── */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            {/* Drawer panel */}
                            <motion.aside
                                key="drawer"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed inset-y-0 left-0 z-40 w-64 lg:hidden"
                            >
                                <Sidebar onClose={() => setSidebarOpen(false)} />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* ── Main content ───────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
