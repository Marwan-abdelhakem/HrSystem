import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    FileText,
    ClipboardList,
    CalendarCheck,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_ICON = {
    pending: <Clock size={14} className="text-warning" />,
    approved: <CheckCircle2 size={14} className="text-success" />,
    rejected: <XCircle size={14} className="text-error" />,
};

const STATUS_BADGE = {
    pending: "badge-warning",
    approved: "badge-success",
    rejected: "badge-error",
};

export default function HRDashboard() {
    const { user } = useAuthStore();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeeCount, setEmployeeCount] = useState("—");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leaveRes, usersRes] = await Promise.allSettled([
                    api.get("/api/leave/getAllRequest"),
                    api.get("/api/users/getAllUsers"),
                ]);

                if (leaveRes.status === "fulfilled") {
                    setLeaveRequests(leaveRes.value.data.data?.slice(0, 5) ?? []);
                }
                if (usersRes.status === "fulfilled") {
                    setEmployeeCount(usersRes.value.data.data.users?.length ?? 0);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = [
        {
            title: "Total Employees",
            value: loading ? "…" : employeeCount,
            icon: <Users size={20} />,
            color: "bg-primary/10",
            iconColor: "text-primary",
        },
        {
            title: "Leave Requests",
            value: loading ? "…" : leaveRequests.length,
            icon: <FileText size={20} />,
            color: "bg-amber-100",
            iconColor: "text-amber-600",
            trend: "Pending review",
        },
        {
            title: "Tasks Assigned",
            value: "—",
            icon: <ClipboardList size={20} />,
            color: "bg-violet-100",
            iconColor: "text-violet-600",
        },
        {
            title: "Attendance Today",
            value: "—",
            icon: <CalendarCheck size={20} />,
            color: "bg-emerald-100",
            iconColor: "text-emerald-600",
        },
    ];

    return (
        <div>
            <PageHeader
                title={`Hello, ${user?.user_name} 👋`}
                subtitle="Manage your team's requests, tasks, and attendance."
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

            {/* Leave requests table */}
            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <FileText size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">Recent Leave Requests</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <span className="loading loading-spinner text-primary" />
                    </div>
                ) : leaveRequests.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No leave requests found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>Employee ID</th>
                                    <th>Type</th>
                                    <th>Days</th>
                                    <th>Start</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="font-mono text-xs text-slate-500">
                                            {req.employeeId?.slice(-6)}
                                        </td>
                                        <td className="capitalize text-sm">{req.leaveType}</td>
                                        <td className="text-sm">{req.totalDays}</td>
                                        <td className="text-sm text-slate-500">
                                            {new Date(req.startDate).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-sm capitalize ${STATUS_BADGE[req.status] ?? "badge-ghost"
                                                    }`}
                                            >
                                                {STATUS_ICON[req.status]}
                                                <span className="ml-1">{req.status}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
