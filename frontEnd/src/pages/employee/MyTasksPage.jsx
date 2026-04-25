import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckSquare, CheckCircle2, Clock, AlertCircle,
    Plus, Trash2, User, Users,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import TaskCreationModal from "../../components/employee/TaskCreationModal";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getMyTasks, getCreatedTasks, updateTaskStatus, deleteCreatedTask } from "../../api/services/taskService";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS = {
    available: { badge: "badge-warning", label: "Pending", icon: <Clock size={12} /> },
    unavailable: { badge: "badge-success", label: "Done", icon: <CheckCircle2 size={12} /> },
};

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
    { id: "assigned", label: "Assigned to Me", icon: User },
    { id: "created", label: "Created by Me", icon: Users },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

// ─── Single task card ─────────────────────────────────────────────────────────

function TaskCard({ task, onMarkDone, onDelete, updating, isCreatedTab }) {
    const [note, setNote] = useState(task.notes ?? "");
    const status = STATUS[task.status] ?? STATUS.available;
    const isDone = task.status === "unavailable";
    const isOverdue = !isDone && new Date(task.endDate) < new Date();

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}
            transition={{ duration: 0.18 }}
            className={`card-soft transition-all ${isDone ? "opacity-55" : ""}`}
        >
            <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold text-slate-800 text-sm ${isDone ? "line-through" : ""}`}>
                            {task.title}
                        </h3>
                        <span className={`badge badge-sm gap-1 ${status.badge}`}>
                            {status.icon} {status.label}
                        </span>
                        {isOverdue && <span className="badge badge-sm badge-error">Overdue</span>}
                    </div>

                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                        <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
                        <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                        {isCreatedTab && task.assignTo && (
                            <span className="text-primary font-medium">
                                → Assigned to: <span className="font-mono">{task.assignTo.slice(-6)}</span>
                            </span>
                        )}
                    </div>

                    {task.notes && !isDone && (
                        <p className="text-xs text-slate-400 mt-1 italic">Note: {task.notes}</p>
                    )}
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-2 shrink-0">
                    {/* Mark done — only on assigned tab, only if pending */}
                    {!isCreatedTab && !isDone && (
                        <div className="flex flex-col gap-1.5 min-w-[180px]">
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Completion note…"
                                className="input input-bordered input-xs bg-white focus:border-primary"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={updating}
                                onClick={() => onMarkDone(task._id, note)}
                                className="btn btn-success btn-xs gap-1"
                            >
                                {updating ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <><CheckCircle2 size={12} /> Mark Done</>
                                )}
                            </motion.button>
                        </div>
                    )}

                    {/* Delete — only on created tab */}
                    {isCreatedTab && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(task._id)}
                            className="btn btn-ghost btn-xs text-error hover:bg-red-50"
                            aria-label="Delete task"
                        >
                            <Trash2 size={13} />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyTasksPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("assigned");
    const [modalOpen, setModalOpen] = useState(false);
    const [updating, setUpdating] = useState(null);
    const [toast, setToast] = useState(null);

    const {
        data: assignedTasks,
        loading: loadingAssigned,
        error: errorAssigned,
        refetch: refetchAssigned,
    } = useApi(() => getMyTasks(user._id), [user?._id]);

    const {
        data: createdTasks,
        loading: loadingCreated,
        error: errorCreated,
        refetch: refetchCreated,
    } = useApi(() => getCreatedTasks(user._id), [user?._id]);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleMarkDone = async (taskId, note) => {
        setUpdating(taskId);
        try {
            await updateTaskStatus(taskId, { status: "unavailable", notes: note });
            refetchAssigned();
            showToast("Task marked as done!");
        } catch (err) {
            showToast(err?.response?.data?.message ?? "Update failed.", "error");
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await deleteCreatedTask(taskId);
            refetchCreated();
            showToast("Task deleted.");
        } catch (err) {
            showToast(err?.response?.data?.message ?? "Delete failed.", "error");
        }
    };

    const handleTaskCreated = () => {
        refetchCreated();
        showToast("Task created successfully!");
    };

    // Stats
    const pendingCount = assignedTasks?.filter((t) => t.status === "available").length ?? 0;
    const doneCount = assignedTasks?.filter((t) => t.status === "unavailable").length ?? 0;
    const createdCount = createdTasks?.length ?? 0;

    const isLoading = activeTab === "assigned" ? loadingAssigned : loadingCreated;
    const hasError = activeTab === "assigned" ? errorAssigned : errorCreated;
    const tasks = activeTab === "assigned" ? (assignedTasks ?? []) : (createdTasks ?? []);

    return (
        <div className="relative pb-20">
            <PageHeader
                title="My Tasks"
                subtitle="Manage tasks assigned to you and tasks you've created for peers."
            />

            {/* Summary pills */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <span className="badge badge-lg badge-warning gap-1">
                    <Clock size={13} /> {pendingCount} Pending
                </span>
                <span className="badge badge-lg badge-success gap-1">
                    <CheckCircle2 size={13} /> {doneCount} Done
                </span>
                <span className="badge badge-lg badge-primary gap-1">
                    <Users size={13} /> {createdCount} Created
                </span>
            </div>

            {/* Toast */}
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

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <motion.button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${activeTab === id
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                        <span className={`badge badge-xs ml-0.5 ${activeTab === id ? "badge-primary" : "badge-ghost"}`}>
                            {id === "assigned" ? (assignedTasks?.length ?? 0) : (createdTasks?.length ?? 0)}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* Task list */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === "assigned" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <span className="loading loading-spinner text-primary loading-md" />
                        </div>
                    ) : hasError ? (
                        <div className="card-soft flex items-center gap-2 text-error justify-center py-10 text-sm">
                            <AlertCircle size={16} /> {hasError}
                        </div>
                    ) : tasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-soft flex flex-col items-center gap-3 py-16 text-slate-400"
                        >
                            <CheckSquare size={40} className="opacity-30" />
                            <p className="text-sm font-medium">
                                {activeTab === "assigned"
                                    ? "No tasks assigned to you yet."
                                    : "You haven't created any tasks yet."}
                            </p>
                            {activeTab === "created" && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="btn btn-primary btn-sm gap-2 mt-1"
                                >
                                    <Plus size={14} /> Create your first task
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    isCreatedTab={activeTab === "created"}
                                    updating={updating === task._id}
                                    onMarkDone={handleMarkDone}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Floating Action Button ─────────────────────────────────────────── */}
            <motion.button
                onClick={() => setModalOpen(true)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.1, boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-primary text-white
                   shadow-lg flex items-center justify-center"
                aria-label="Create new task"
            >
                <Plus size={24} />
            </motion.button>

            {/* Task creation modal */}
            <TaskCreationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={handleTaskCreated}
            />
        </div>
    );
}
