import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, DollarSign, Clock, CheckCircle2, XCircle,
    AlertCircle, Inbox,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getMyRequests } from "../../api/services/requestService";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS = {
    pending: { badge: "badge-warning", icon: <Clock size={12} />, label: "Pending" },
    approved: { badge: "badge-success", icon: <CheckCircle2 size={12} />, label: "Approved" },
    rejected: { badge: "badge-error", icon: <XCircle size={12} />, label: "Rejected" },
};

// ─── Request type config ──────────────────────────────────────────────────────

const TYPE_CONFIG = {
    leave: {
        icon: <FileText size={15} className="text-violet-500" />,
        bg: "bg-violet-50",
        border: "border-violet-100",
        label: "Leave Request",
        detail: (r) => `${r.leaveType} · ${r.totalDays} day${r.totalDays !== 1 ? "s" : ""}`,
    },
    salary: {
        icon: <DollarSign size={15} className="text-emerald-500" />,
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        label: "Salary Request",
        detail: (r) =>
            `${r.allowanceType?.replace(/([A-Z])/g, " $1").trim()} · ${Number(r.requestedAmount).toLocaleString()} EGP`,
    },
};

// ─── Animation ────────────────────────────────────────────────────────────────

const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyRequestsPage() {
    const { user } = useAuth();

    const { data: requests, loading, error } = useApi(
        () => getMyRequests(user._id),
        [user?._id]
    );

    // Summary counts
    const counts = {
        total: requests?.length ?? 0,
        pending: requests?.filter((r) => r.status === "pending").length ?? 0,
        approved: requests?.filter((r) => r.status === "approved").length ?? 0,
        rejected: requests?.filter((r) => r.status === "rejected").length ?? 0,
    };

    return (
        <div>
            <PageHeader
                title="My Requests"
                subtitle="Track the status of all your submitted leave and salary requests."
            />

            {/* Summary strip */}
            {!loading && requests && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7"
                >
                    {[
                        { label: "Total", value: counts.total, cls: "bg-slate-50  border-slate-200  text-slate-700" },
                        { label: "Pending", value: counts.pending, cls: "bg-amber-50  border-amber-200  text-amber-700" },
                        { label: "Approved", value: counts.approved, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                        { label: "Rejected", value: counts.rejected, cls: "bg-red-50    border-red-200    text-red-700" },
                    ].map(({ label, value, cls }) => (
                        <div key={label} className={`rounded-xl border px-4 py-3 ${cls}`}>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <span className="loading loading-spinner text-primary loading-md" />
                </div>
            ) : error ? (
                <div className="card-soft flex items-center gap-2 text-error justify-center py-10 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            ) : requests?.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-soft flex flex-col items-center gap-3 py-16 text-slate-400"
                >
                    <Inbox size={44} className="opacity-30" />
                    <p className="text-sm font-medium">No requests submitted yet.</p>
                    <p className="text-xs text-slate-300">
                        Use "New Request" in the sidebar to submit a leave or salary request.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                >
                    {requests.map((req) => {
                        const type = TYPE_CONFIG[req.requestType] ?? TYPE_CONFIG.leave;
                        const status = STATUS[req.status] ?? STATUS.pending;

                        return (
                            <motion.div
                                key={req._id}
                                variants={itemVariants}
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.15 }}
                                className={`flex items-start gap-4 p-4 rounded-2xl border ${type.border} ${type.bg}
                            hover:shadow-sm transition-all duration-150`}
                            >
                                {/* Type icon bubble */}
                                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                                    {type.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-slate-800">{type.label}</span>
                                        <span className={`badge badge-sm gap-1 ${status.badge}`}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{type.detail(req)}</p>

                                    {/* Leave-specific fields */}
                                    {req.requestType === "leave" && (
                                        <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                                            <span>From: {new Date(req.startDate).toLocaleDateString()}</span>
                                            <span>To: {new Date(req.endDate).toLocaleDateString()}</span>
                                            {req.reason && <span className="italic truncate max-w-[160px]">"{req.reason}"</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Date submitted */}
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-slate-400">
                                        {new Date(req.createdAt).toLocaleDateString("en-GB", {
                                            day: "2-digit", month: "short", year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
