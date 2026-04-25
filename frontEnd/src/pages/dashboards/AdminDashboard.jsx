import { motion } from "framer-motion";
import {
    Users, Briefcase, ClipboardList, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import useAuth from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";
import { getAllUsers } from "../../api/services/userService";
import { getAllJobs } from "../../api/services/jobService";
import { getAllTasks } from "../../api/services/taskService";

// ─── Animations ───────────────────────────────────────────────────────────────

const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { user } = useAuth();

    const { data: users, loading: loadingUsers } = useApi(getAllUsers);
    const { data: jobs, loading: loadingJobs } = useApi(getAllJobs);
    const { data: tasks, loading: loadingTasks } = useApi(getAllTasks);

    const pendingTasks = tasks?.filter((t) => t.status === "available").length ?? 0;
    const doneTasks = tasks?.filter((t) => t.status === "unavailable").length ?? 0;

    const stats = [
        {
            title: "Total Employees",
            value: loadingUsers ? "…" : (users?.length ?? 0),
            icon: <Users size={20} />,
            color: "bg-primary/10",
            iconColor: "text-primary",
            trend: "Active headcount",
        },
        {
            title: "Open Positions",
            value: loadingJobs ? "…" : (jobs?.length ?? 0),
            icon: <Briefcase size={20} />,
            color: "bg-violet-100",
            iconColor: "text-violet-600",
            trend: "Across all departments",
        },
        {
            title: "Pending Tasks",
            value: loadingTasks ? "…" : pendingTasks,
            icon: <ClipboardList size={20} />,
            color: "bg-amber-100",
            iconColor: "text-amber-600",
            trend: "Awaiting completion",
        },
        {
            title: "Completed Tasks",
            value: loadingTasks ? "…" : doneTasks,
            icon: <TrendingUp size={20} />,
            color: "bg-emerald-100",
            iconColor: "text-emerald-600",
            trend: "All time",
        },
    ];

    // Quick nav cards
    const quickNav = [
        { label: "User Management", to: "/admin/users", icon: Users, desc: "Add, edit or remove users" },
        { label: "Task Assignment", to: "/admin/tasks", icon: ClipboardList, desc: "Assign tasks to employees" },
        { label: "Create Job", to: "/admin/jobs", icon: Briefcase, desc: "Post a new job opening" },
        { label: "Create Meeting", to: "/admin/meetings", icon: TrendingUp, desc: "Schedule a team meeting" },
    ];

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${user?.user_name} `}
                subtitle="Here's a live overview of your organization."
            />

            {/* Stats grid */}
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

            {/* Quick navigation cards */}
            <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
                {quickNav.map(({ label, to, icon: Icon, desc }) => (
                    <motion.div
                        key={to}
                        variants={cardVariants}
                        whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link
                            to={to}
                            className="card-soft flex flex-col gap-3 h-full hover:border-primary/30
                                       transition-colors duration-150 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center
                                            justify-center group-hover:bg-primary/20 transition-colors">
                                <Icon size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
