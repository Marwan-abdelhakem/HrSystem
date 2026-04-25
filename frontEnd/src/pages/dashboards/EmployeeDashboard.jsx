import { motion } from "framer-motion";
import { CheckSquare, Clock, CheckCircle2, CalendarDays, FileText, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import useAuth from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";
import { getMyTasks } from "../../api/services/taskService";
import { getMyRequests } from "../../api/services/requestService";

const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_BADGE = {
    available: "badge-warning",
    unavailable: "badge-success",
};

const REQ_STATUS_BADGE = {
    pending: "badge-warning",
    approved: "badge-success",
    rejected: "badge-error",
};

export default function EmployeeDashboard() {
    const { user } = useAuth();

    const { data: tasks, loading: loadingTasks } = useApi(() => getMyTasks(user._id), [user?._id]);
    const { data: requests, loading: loadingRequests } = useApi(() => getMyRequests(user._id), [user?._id]);

    const pendingTasks = tasks?.filter((t) => t.status === "available").length ?? 0;
    const doneTasks = tasks?.filter((t) => t.status === "unavailable").length ?? 0;
    const pendingRequests = requests?.filter((r) => r.status === "pending").length ?? 0;

    const stats = [
        {
            title: "Total Tasks",
            value: loadingTasks ? "…" : (tasks?.length ?? 0),
            icon: <CheckSquare size={20} />,
            color: "bg-primary/10",
            iconColor: "text-primary",
        },
        {
            title: "Pending Tasks",
            value: loadingTasks ? "…" : pendingTasks,
            icon: <Clock size={20} />,
            color: "bg-amber-100",
            iconColor: "text-amber-600",
        },
        {
            title: "Completed",
            value: loadingTasks ? "…" : doneTasks,
            icon: <CheckCircle2 size={20} />,
            color: "bg-emerald-100",
            iconColor: "text-emerald-600",
        },
        {
            title: "Pending Requests",
            value: loadingRequests ? "…" : pendingRequests,
            icon: <FileText size={20} />,
            color: "bg-violet-100",
            iconColor: "text-violet-600",
            trend: "Awaiting HR review",
        },
    ];

    // Recent 4 tasks
    const recentTasks = tasks?.slice(0, 4) ?? [];
    // Recent 4 requests
    const recentRequests = requests?.slice(0, 4) ?? [];

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.user_name} 👋`}
                subtitle="Here's a snapshot of your tasks and requests."
            />

            {/* Stats */}
            <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
            >
                {stats.map((s) => (
                    <motion.div key={s.title} variants={cardVariants}>
                        <StatCard {...s} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Recent tasks */}
                <div className="card-soft">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <CheckSquare size={17} className="text-primary" />
                            <h2 className="font-semibold text-slate-700">Recent Tasks</h2>
                        </div>
                        <Link
                            to="/employee/tasks"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {loadingTasks ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner text-primary loading-sm" />
                        </div>
                    ) : recentTasks.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                            <CheckSquare size={28} className="opacity-30" />
                            <p className="text-xs">No tasks yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentTasks.map((task) => {
                                const isOverdue = task.status === "available" && new Date(task.endDate) < new Date();
                                return (
                                    <motion.div
                                        key={task._id}
                                        whileHover={{ x: 3 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center justify-between gap-3 p-3 rounded-xl
                               border border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium text-slate-800 truncate ${task.status === "unavailable" ? "line-through opacity-60" : ""}`}>
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Due: {new Date(task.endDate).toLocaleDateString()}
                                                {isOverdue && <span className="ml-1 text-error font-medium">Overdue</span>}
                                            </p>
                                        </div>
                                        <span className={`badge badge-sm shrink-0 ${STATUS_BADGE[task.status] ?? "badge-ghost"}`}>
                                            {task.status === "available" ? "Pending" : "Done"}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent requests + quick actions */}
                <div className="flex flex-col gap-5">
                    {/* Recent requests */}
                    <div className="card-soft flex-1">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <FileText size={17} className="text-primary" />
                                <h2 className="font-semibold text-slate-700">Recent Requests</h2>
                            </div>
                            <Link
                                to="/employee/requests"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>

                        {loadingRequests ? (
                            <div className="flex justify-center py-8">
                                <span className="loading loading-spinner text-primary loading-sm" />
                            </div>
                        ) : recentRequests.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                                <FileText size={28} className="opacity-30" />
                                <p className="text-xs">No requests submitted yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {recentRequests.map((req) => (
                                    <div
                                        key={req._id}
                                        className="flex items-center justify-between gap-3 p-3 rounded-xl
                               border border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 capitalize">
                                                {req.requestType === "leave"
                                                    ? `${req.leaveType} Leave`
                                                    : req.allowanceType?.replace(/([A-Z])/g, " $1").trim()}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`badge badge-sm shrink-0 capitalize ${REQ_STATUS_BADGE[req.status] ?? "badge-ghost"}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="card-soft">
                        <h2 className="font-semibold text-slate-700 mb-4 text-sm">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "New Task", to: "/employee/tasks", icon: <Plus size={14} /> },
                                { label: "New Request", to: "/employee/request", icon: <FileText size={14} /> },
                                { label: "My Tasks", to: "/employee/tasks", icon: <CheckSquare size={14} /> },
                                { label: "My Requests", to: "/employee/requests", icon: <CalendarDays size={14} /> },
                            ].map(({ label, to, icon }) => (
                                <motion.div key={label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        to={to}
                                        className="btn btn-outline btn-sm gap-1.5 w-full justify-start text-xs"
                                    >
                                        {icon} {label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
