import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Search, AlertCircle, User } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";
import { getAllUsers } from "../../api/services/userService";
import { createTask } from "../../api/services/taskService";

// ─── Animation ────────────────────────────────────────────────────────────────

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 24 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
    exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.18 } },
};

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY = {
    title: "",
    description: "",
    assignTo: "",       // target employee _id
    startDate: "",
    endDate: "",
    notes: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Props:
 *   open      : boolean
 *   onClose   : () => void
 *   onCreated : (task) => void   — called after successful creation
 */
export default function TaskCreationModal({ open, onClose, onCreated }) {
    const { user } = useAuth();
    const { data: allUsers } = useApi(getAllUsers);

    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    // All employees (including self for personal tasks)
    const employees = useMemo(
        () => allUsers?.filter((u) => u.role === "Employee") ?? [],
        [allUsers]
    );

    // Filtered by search query
    const filtered = useMemo(
        () =>
            search.trim()
                ? employees.filter((e) =>
                    e.user_name.toLowerCase().includes(search.toLowerCase()) ||
                    e.email.toLowerCase().includes(search.toLowerCase())
                )
                : employees,
        [employees, search]
    );

    const selectedEmployee = employees.find((e) => e._id === form.assignTo);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        setFormError("");
    };

    const handleSelectEmployee = (emp) => {
        setForm((p) => ({ ...p, assignTo: emp._id }));
        setSearch("");
        setDropdownOpen(false);
    };

    const handleClose = () => {
        setForm(EMPTY);
        setSearch("");
        setFormError("");
        onClose();
    };

    const validate = () => {
        if (!form.title.trim()) return "Title is required.";
        if (!form.description.trim()) return "Description is required.";
        if (!form.assignTo) return "Please select an assignee.";
        if (!form.startDate) return "Start date is required.";
        if (!form.endDate) return "End date is required.";
        if (new Date(form.endDate) <= new Date(form.startDate))
            return "End date must be after start date.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return setFormError(err);

        setLoading(true);
        try {
            const payload = {
                ...form,
                assignBy: user.user_name,
                status: "available",
            };
            const created = await createTask(payload);
            onCreated?.(created);
            handleClose();
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Failed to create task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            key="modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <ClipboardList size={16} className="text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-800 text-sm">Create New Task</h2>
                                        <p className="text-xs text-slate-400">Assign to yourself or a peer</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="btn btn-ghost btn-sm btn-square text-slate-400 hover:text-slate-700"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                                {/* Error */}
                                <AnimatePresence>
                                    {formError && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="alert alert-error py-2.5 text-sm"
                                        >
                                            <AlertCircle size={14} /> {formError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Title */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            Title *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Prepare Q3 report"
                                        className="input input-bordered input-sm bg-white focus:border-primary"
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            Description *
                                        </span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe what needs to be done…"
                                        rows={3}
                                        className="textarea textarea-bordered textarea-sm bg-white focus:border-primary resize-none"
                                    />
                                </div>

                                {/* Assignee — searchable dropdown */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            Assign To *
                                        </span>
                                    </label>

                                    {/* Selected pill */}
                                    {selectedEmployee ? (
                                        <div className="flex items-center gap-2 p-2.5 rounded-xl border border-primary/40 bg-primary/5">
                                            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {selectedEmployee.user_name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {selectedEmployee.user_name}
                                                    {selectedEmployee._id === user._id && (
                                                        <span className="ml-1 text-xs text-primary">(You)</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">{selectedEmployee.email}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setForm((p) => ({ ...p, assignTo: "" }))}
                                                className="btn btn-ghost btn-xs btn-square text-slate-400"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => {
                                                        setSearch(e.target.value);
                                                        setDropdownOpen(true);
                                                    }}
                                                    onFocus={() => setDropdownOpen(true)}
                                                    placeholder="Search by name or email…"
                                                    className="input input-bordered input-sm bg-white focus:border-primary w-full pl-8"
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {dropdownOpen && (
                                                    <motion.ul
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        transition={{ duration: 0.12 }}
                                                        className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                                                    >
                                                        {/* Self-assign option */}
                                                        {(!search || user.user_name.toLowerCase().includes(search.toLowerCase())) && (
                                                            <li>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectEmployee(user)}
                                                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-primary/5 transition-colors text-left"
                                                                >
                                                                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                                        {user.user_name.slice(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-slate-800 truncate">
                                                                            {user.user_name} <span className="text-primary text-xs">(You)</span>
                                                                        </p>
                                                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                                    </div>
                                                                </button>
                                                            </li>
                                                        )}

                                                        {filtered
                                                            .filter((e) => e._id !== user._id)
                                                            .map((emp) => (
                                                                <li key={emp._id}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelectEmployee(emp)}
                                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                                                    >
                                                                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                                            {emp.user_name.slice(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-medium text-slate-700 truncate">{emp.user_name}</p>
                                                                            <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                                                                        </div>
                                                                    </button>
                                                                </li>
                                                            ))}

                                                        {filtered.filter((e) => e._id !== user._id).length === 0 && !search && (
                                                            <li className="px-4 py-3 text-xs text-slate-400 text-center">
                                                                No other employees found
                                                            </li>
                                                        )}
                                                    </motion.ul>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                Start Date *
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={form.startDate}
                                            onChange={handleChange}
                                            className="input input-bordered input-sm bg-white focus:border-primary"
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                Due Date *
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={form.endDate}
                                            onChange={handleChange}
                                            className="input input-bordered input-sm bg-white focus:border-primary"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            Notes
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        placeholder="Optional notes or context…"
                                        className="input input-bordered input-sm bg-white focus:border-primary"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="btn btn-ghost btn-sm flex-1 border border-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary btn-sm flex-1 gap-1.5"
                                    >
                                        {loading ? (
                                            <span className="loading loading-spinner loading-xs" />
                                        ) : (
                                            <><ClipboardList size={14} /> Create Task</>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
