import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Briefcase,
    CalendarCheck,
    TrendingUp,
    ShieldCheck,
    Activity,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

// ─── Animation helpers ────────────────────────────────────────────────────────

const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─── Recent activity mock (replace with real API call) ───────────────────────

const MOCK_ACTIVITY = [
    { id: 1, text: "New employee John Doe was added", time: "2 min ago", type: "user" },
    { id: 2, text: "Leave request approved for Sara Ahmed", time: "15 min ago", type: "leave" },
    { id: 3, text: "Task #42 marked as completed", time: "1 hr ago", type: "task" },
    { id: 4, text: "Salary request from Ahmed Ali approved", time: "3 hr ago", type: "salary" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const [userCount, setUserCount] = useState("—");
    const [jobCount, setJobCount] = useState("—");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, jobsRes] = await Promise.allSettled([
                    api.get("/api/users/getAllUsers"),
                    api.get("/api/job/getAlljobs"),
                ]);

                if (usersRes.status === "fulfilled") {
                    setUserCount(usersRes.value.data.data.users?.length ?? 0);
                }
                if (jobsRes.status === "fulfilled") {
                    setJobCount(jobsRes.value.data.data?.length ?? 0);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        {
            title: "Total Employees",
            value: loading ? "…" : userCount,
            icon: <Users size={20} />,
            color: "bg-primary/10",
            iconColor: "text-primary",
            trend: "Active headcount",
        },
        {
            title: "Open Positions",
            value: loading ? "…" : jobCount,
            icon: <Briefcase size={20} />,
            color: "bg-violet-100",
            iconColor: "text-violet-600",
            trend: "Across all departments",
        },
        {
            title: "Attendance Rate",
            value: "94%",
            icon: <CalendarCheck size={20} />,
            color: "bg-emerald-100",
            iconColor: "text-emerald-600",
            trend: "This month",
        },
        {
            title: "Performance",
            value: "87%",
            icon: <TrendingUp size={20} />,
            color: "bg-amber-100",
            iconColor: "text-amber-600",
            trend: "Avg. task completion",
        },
    ];

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${user?.user_name} 👋`}
                subtitle="Here's what's happening across the organization today."
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

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent activity */}
                <div className="card-soft">
                    <div className="flex items-center gap-2 mb-5">
                        <Activity size={17} className="text-primary" />
                        <h2 className="font-semibold text-slate-700">Recent Activity</h2>
                    </div>

                    <ul className="space-y-3">
                        {MOCK_ACTIVITY.map((item) => (
                            <li key={item.id} className="flex items-start gap-3">
                                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Quick access */}
                <div className="card-soft">
                    <div className="flex items-center gap-2 mb-5">
                        <ShieldCheck size={17} className="text-primary" />
                        <h2 className="font-semibold text-slate-700">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Add Employee", icon: <Users size={16} /> },
                            { label: "Post a Job", icon: <Briefcase size={16} /> },
                            { label: "View Reports", icon: <TrendingUp size={16} /> },
                            { label: "System Logs", icon: <Activity size={16} /> },
                        ].map(({ label, icon }) => (
                            <motion.button
                                key={label}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn btn-outline btn-sm gap-2 justify-start"
                            >
                                {icon}
                                {label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
