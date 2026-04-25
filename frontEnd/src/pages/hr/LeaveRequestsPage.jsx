import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import { getAllLeaveRequests, updateLeaveRequest } from "../../api/services/leaveService";

const STATUS_BADGE = { pending: "badge-warning", approved: "badge-success", rejected: "badge-error" };
const STATUS_ICON = {
    pending: <Clock size={12} />,
    approved: <CheckCircle2 size={12} />,
    rejected: <XCircle size={12} />,
};

export default function LeaveRequestsPage() {
    const { data: requests, loading, error, refetch } = useApi(getAllLeaveRequests);
    const [updating, setUpdating] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdate = async (employeeId, status, totalDays) => {
        setUpdating(employeeId);
        try {
            await updateLeaveRequest(employeeId, { status, totalDays });
            refetch();
            showToast(`Request ${status} successfully.`);
        } catch (err) {
            showToast(err?.response?.data?.message ?? "Update failed.", "error");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="Leave Requests"
                subtitle="Review and approve or reject employee leave requests."
            />

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`alert mb-5 py-3 text-sm ${toast.type === "error" ? "alert-error" : "alert-success"}`}
                    >
                        <CheckCircle2 size={14} /> {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <FileText size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">All Leave Requests</h2>
                    {requests && (
                        <span className="badge badge-primary badge-sm ml-auto">{requests.length} total</span>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner text-primary loading-md" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-error py-8 justify-center text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                ) : requests?.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-10">No leave requests found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Days</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <motion.tr
                                        key={req._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                                    {(req.employeeName ?? "?").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">
                                                        {req.employeeName ?? "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {req.employeeEmail ?? ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="capitalize text-sm">{req.leaveType}</td>
                                        <td className="text-sm font-medium">{req.totalDays}</td>
                                        <td className="text-sm text-slate-500">
                                            {new Date(req.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="text-sm text-slate-500">
                                            {new Date(req.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="text-sm text-slate-500 max-w-[140px] truncate">
                                            {req.reason || "—"}
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm gap-1 capitalize ${STATUS_BADGE[req.status] ?? "badge-ghost"}`}>
                                                {STATUS_ICON[req.status]}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {req.status === "pending" ? (
                                                <div className="flex gap-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={updating === req.employeeId}
                                                        onClick={() => handleUpdate(req.employeeId, "approved", req.totalDays)}
                                                        className="btn btn-success btn-xs gap-1"
                                                    >
                                                        {updating === req.employeeId ? (
                                                            <span className="loading loading-spinner loading-xs" />
                                                        ) : (
                                                            <><CheckCircle2 size={11} /> Approve</>
                                                        )}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={updating === req.employeeId}
                                                        onClick={() => handleUpdate(req.employeeId, "rejected", req.totalDays)}
                                                        className="btn btn-error btn-xs gap-1"
                                                    >
                                                        <XCircle size={11} /> Reject
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Reviewed</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
