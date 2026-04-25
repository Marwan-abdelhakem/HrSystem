import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList, Plus, Trash2, X, AlertCircle,
    CheckCircle2, Clock,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getAssignableUsers } from "../../api/services/userService";
import { getAllTasks, createTask, deleteTask } from "../../api/services/taskService";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS = {
    available: { badge: "badge-warning", label: "Pending", icon: <Clock size={11} /> },
    unavailable: { badge: "badge-success", label: "Done", icon: <CheckCircle2 size={11} /> },
};

const ROLE_BADGE = { HR: "badge-warning", Employee: "badge-success" };

const EMPTY_FORM = {
    title: "", description: "", assignTo: "",
    startDate: "", endDate: "", notes: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminTasksPage() {
    const { user } = useAuth();

    // All tasks (Admin can see everything)
    const { data: tasks, loading: loadingTasks, error: tasksError, refetch } = useApi(getAllTasks);

    // Both HR and Employee users — Admin can assign to either
    const { data: assignable, loading: loadingAssignable, error: assignableError } = useApi(getAssignableUsers);

    // id → user object map for the table
    const userMap = {};
    (assignable ?? []).forEach((u) => { userMap[u._id] = u; });

    // Split into groups for the dropdown optgroups
    const hrUsers = (assignable ?? []).filter((u) => u.role === "HR");
    const empUsers = (assignable ?? []).filter((u) => u.role === "Employee");

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        setFormError("");
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.assignTo || !form.startDate || !form.endDate) {
            return setFormError("Please fill in all required fields.");
        }
        setFormLoading(true);
        setFormError("");
        try {
            await createTask({ ...form, assignBy: user.user_name, status: "available" });
            setModalOpen(false);
            setForm(EMPTY_FORM);
            refetch();
            showToast("Task assigned successfully.");
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Failed to create task.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;
        setDeletingId(id);
        try {
            await deleteTask(id);
            refetch();
            showToast("Task deleted.");
        } catch {
            showToast("Failed to delete task.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="Task Assignment"
                subtitle="Assign tasks to HR staff and employees."
                action={
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setModalOpen(true)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={15} /> Assign Task
                    </motion.button>
                }
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`alert mb-5 py-3 text-sm ${toast.type === "error" ? "alert-error" : "alert-success"}`}
                    >
                        <CheckCircle2 size={14} /> {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Task table ─────────────────────────────────────────────── */}
            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <ClipboardList size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">All Tasks</h2>
                    {!loadingTasks && tasks && (
                        <span className="badge badge-primary badge-sm ml-auto">{tasks.length} total</span>
                    )}
                </div>

                {loadingTasks ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner text-primary loading-md" />
                    </div>
                ) : tasksError ? (
                    <div className="flex items-center gap-2 text-error py-8 justify-center text-sm">
                        <AlertCircle size={16} /> {tasksError}
                    </div>
                ) : !tasks || tasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                        <ClipboardList size={36} className="opacity-30" />
                        <p className="text-sm">No tasks yet. Click "Assign Task" to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>Task</th>
                                    <th>Assigned To</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => {
                                    const status = STATUS[task.status] ?? STATUS.available;
                                    const assignee = userMap[task.assignTo];
                                    const name = assignee?.user_name ?? task.assignTo?.slice(-6) ?? "—";
                                    const role = assignee?.role;
                                    const isOverdue = task.status === "available" && new Date(task.endDate) < new Date();

                                    return (
                                        <motion.tr key={task._id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50 transition-colors">

                                            {/* Task info */}
                                            <td className="max-w-[220px]">
                                                <p className="font-medium text-slate-800 text-sm truncate">{task.title}</p>
                                                <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                                            </td>

                                            {/* Assignee — name + role badge */}
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary
                                                                    flex items-center justify-center text-xs font-bold shrink-0">
                                                        {name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 leading-tight">{name}</p>
                                                        {role && (
                                                            <span className={`badge badge-xs ${ROLE_BADGE[role] ?? "badge-ghost"}`}>
                                                                {role}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Due date */}
                                            <td>
                                                <span className={`text-sm ${isOverdue ? "text-error font-medium" : "text-slate-500"}`}>
                                                    {new Date(task.endDate).toLocaleDateString()}
                                                    {isOverdue && " ⚠"}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className={`badge badge-sm gap-1 ${status.badge}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>

                                            {/* Delete */}
                                            <td>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    disabled={deletingId === task._id}
                                                    onClick={() => handleDelete(task._id)}
                                                    className="btn btn-ghost btn-xs text-error hover:bg-red-50">
                                                    {deletingId === task._id
                                                        ? <span className="loading loading-spinner loading-xs" />
                                                        : <Trash2 size={13} />
                                                    }
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Assign Task Modal ──────────────────────────────────────── */}
            <AnimatePresence>
                {modalOpen && (
                    <>
                        <motion.div key="overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30"
                            onClick={() => setModalOpen(false)} />

                        <motion.div key="modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4">

                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList size={18} className="text-primary" />
                                        <div>
                                            <h2 className="font-semibold text-slate-800">Assign New Task</h2>
                                            <p className="text-xs text-slate-400">Assign to HR staff or an employee</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm btn-square">
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleCreate} className="p-6 space-y-4">
                                    {formError && (
                                        <div className="alert alert-error py-2 text-sm">
                                            <AlertCircle size={14} /> {formError}
                                        </div>
                                    )}

                                    {/* Title */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Title *</span>
                                        </label>
                                        <input type="text" name="title" value={form.title} onChange={handleChange}
                                            placeholder="Task title"
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>

                                    {/* Description */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Description *</span>
                                        </label>
                                        <textarea name="description" value={form.description} onChange={handleChange}
                                            placeholder="What needs to be done?"
                                            rows={3}
                                            className="textarea textarea-bordered textarea-sm bg-white focus:border-primary resize-none" />
                                    </div>

                                    {/* Notes */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Notes</span>
                                        </label>
                                        <input type="text" name="notes" value={form.notes} onChange={handleChange}
                                            placeholder="Optional notes"
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-medium text-slate-600">Start Date *</span>
                                            </label>
                                            <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                                                className="input input-bordered input-sm bg-white focus:border-primary" />
                                        </div>
                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-medium text-slate-600">End Date *</span>
                                            </label>
                                            <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                                                className="input input-bordered input-sm bg-white focus:border-primary" />
                                        </div>
                                    </div>

                                    {/* Assign To — grouped by role */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">
                                                Assign To * <span className="text-slate-400 font-normal">(HR or Employee)</span>
                                            </span>
                                        </label>

                                        {assignableError ? (
                                            <div className="alert alert-error py-2 text-xs">
                                                <AlertCircle size={13} />
                                                Failed to load users: {assignableError}
                                            </div>
                                        ) : (
                                            <select name="assignTo" value={form.assignTo} onChange={handleChange}
                                                className="select select-bordered select-sm bg-white focus:border-primary">
                                                <option value="">
                                                    {loadingAssignable ? "Loading users…" : `Select a person… (${(assignable ?? []).length} available)`}
                                                </option>

                                                {/* HR group */}
                                                {hrUsers.length > 0 && (
                                                    <optgroup label="── HR Staff ──">
                                                        {hrUsers.map((u) => (
                                                            <option key={u._id} value={u._id}>
                                                                {u.user_name} — {u.email}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}

                                                {/* Employee group */}
                                                {empUsers.length > 0 && (
                                                    <optgroup label="── Employees ──">
                                                        {empUsers.map((u) => (
                                                            <option key={u._id} value={u._id}>
                                                                {u.user_name} — {u.email}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        )}

                                        {!loadingAssignable && !assignableError && (assignable ?? []).length === 0 && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                No HR or Employee users found. Create users first from User Management.
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setModalOpen(false)}
                                            className="btn btn-ghost btn-sm flex-1">Cancel</button>
                                        <motion.button type="submit" disabled={formLoading}
                                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                            className="btn btn-primary btn-sm flex-1">
                                            {formLoading
                                                ? <span className="loading loading-spinner loading-xs" />
                                                : "Assign Task"
                                            }
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
