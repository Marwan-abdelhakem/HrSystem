import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, FileText, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useAuth from "../../hooks/useAuth";
import { createLeaveRequest } from "../../api/services/leaveService";
import { createSalaryRequest } from "../../api/services/requestService";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
    { id: "leave", label: "Leave Request", icon: FileText },
    { id: "salary", label: "Salary Request", icon: DollarSign },
];

const LEAVE_TYPES = ["annual", "sick", "unpaid", "other"];
const ALLOWANCE_TYPES = ["housingAllowance", "transportationAllowance", "otherAllowance"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewRequestPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("leave");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Leave form
    const [leaveForm, setLeaveForm] = useState({
        leaveType: "annual", totalDays: "", startDate: "", endDate: "", reason: "",
    });

    // Salary form
    const [salaryForm, setSalaryForm] = useState({
        allowanceType: "housingAllowance", requestedAmount: "",
    });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Leave submit ────────────────────────────────────────────────────────────

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!leaveForm.totalDays || !leaveForm.startDate || !leaveForm.endDate) {
            return showToast("Please fill in all required fields.", "error");
        }
        setLoading(true);
        try {
            await createLeaveRequest({ ...leaveForm, employeeId: user._id, status: "pending" });
            showToast("Leave request submitted successfully!");
            setLeaveForm({ leaveType: "annual", totalDays: "", startDate: "", endDate: "", reason: "" });
        } catch (err) {
            showToast(err?.response?.data?.message ?? "Failed to submit request.", "error");
        } finally {
            setLoading(false);
        }
    };

    // ── Salary submit ───────────────────────────────────────────────────────────

    const handleSalarySubmit = async (e) => {
        e.preventDefault();
        if (!salaryForm.requestedAmount) {
            return showToast("Please enter the requested amount.", "error");
        }
        setLoading(true);
        try {
            await createSalaryRequest({ ...salaryForm, employeeId: user._id, status: "pending" });
            showToast("Salary request submitted successfully!");
            setSalaryForm({ allowanceType: "housingAllowance", requestedAmount: "" });
        } catch (err) {
            showToast(err?.response?.data?.message ?? "Failed to submit request.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="New Request"
                subtitle="Submit a leave or salary allowance request."
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`alert mb-6 py-3 text-sm ${toast.type === "error" ? "alert-error" : "alert-success"}`}
                    >
                        {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <motion.button
                        key={id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab(id)}
                        className={`btn btn-sm gap-2 ${activeTab === id ? "btn-primary" : "btn-ghost border border-slate-200"}`}
                    >
                        <Icon size={14} /> {label}
                    </motion.button>
                ))}
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
                {activeTab === "leave" ? (
                    <motion.div
                        key="leave"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="card-soft max-w-lg"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <FileText size={18} className="text-primary" />
                            <h2 className="font-semibold text-slate-800">Leave Request</h2>
                        </div>

                        <form onSubmit={handleLeaveSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-slate-700">Leave Type</span>
                                </label>
                                <select
                                    value={leaveForm.leaveType}
                                    onChange={(e) => setLeaveForm((p) => ({ ...p, leaveType: e.target.value }))}
                                    className="select select-bordered bg-white focus:border-primary"
                                >
                                    {LEAVE_TYPES.map((t) => (
                                        <option key={t} value={t} className="capitalize">{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-slate-700">Number of Days *</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={leaveForm.totalDays}
                                    onChange={(e) => setLeaveForm((p) => ({ ...p, totalDays: e.target.value }))}
                                    placeholder="e.g. 3"
                                    className="input input-bordered bg-white focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-sm font-medium text-slate-700">Start Date *</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveForm.startDate}
                                        onChange={(e) => setLeaveForm((p) => ({ ...p, startDate: e.target.value }))}
                                        className="input input-bordered bg-white focus:border-primary"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-sm font-medium text-slate-700">End Date *</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={leaveForm.endDate}
                                        onChange={(e) => setLeaveForm((p) => ({ ...p, endDate: e.target.value }))}
                                        className="input input-bordered bg-white focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-slate-700">Reason</span>
                                </label>
                                <textarea
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))}
                                    placeholder="Optional reason for your leave…"
                                    rows={3}
                                    className="textarea textarea-bordered bg-white focus:border-primary resize-none"
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary w-full gap-2"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <><PlusCircle size={16} /> Submit Leave Request</>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="salary"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="card-soft max-w-lg"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <DollarSign size={18} className="text-primary" />
                            <h2 className="font-semibold text-slate-800">Salary Allowance Request</h2>
                        </div>

                        <form onSubmit={handleSalarySubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-slate-700">Allowance Type</span>
                                </label>
                                <select
                                    value={salaryForm.allowanceType}
                                    onChange={(e) => setSalaryForm((p) => ({ ...p, allowanceType: e.target.value }))}
                                    className="select select-bordered bg-white focus:border-primary"
                                >
                                    {ALLOWANCE_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t.replace(/([A-Z])/g, " $1").trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-slate-700">Requested Amount (EGP) *</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={salaryForm.requestedAmount}
                                    onChange={(e) => setSalaryForm((p) => ({ ...p, requestedAmount: e.target.value }))}
                                    placeholder="e.g. 500"
                                    className="input input-bordered bg-white focus:border-primary"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                                Your request will be reviewed by HR and applied to your next salary if approved.
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary w-full gap-2"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <><PlusCircle size={16} /> Submit Salary Request</>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
