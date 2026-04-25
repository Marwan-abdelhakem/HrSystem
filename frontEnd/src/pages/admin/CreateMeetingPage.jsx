import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Plus, Trash2, AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getAllUsers } from "../../api/services/userService";
import { createMeeting, getMeetingsByCreator, deleteMeeting } from "../../api/services/meetingService";

// ─── Config ───────────────────────────────────────────────────────────────────

const MEETING_TYPES = ["online", "offline"];

const EMPTY = {
    title: "", subTitle: "", describtion: "",
    day: "", startTime: "", endTime: "",
    typeOfMeeting: "online", zoomLink: "",
    addUsers: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateMeetingPage() {
    const { user } = useAuth();

    const { data: allUsers } = useApi(getAllUsers);
    const { data: meetings, loading, error, refetch } = useApi(
        () => getMeetingsByCreator(user._id),
        [user?._id]
    );

    const employees = allUsers ?? [];

    const [form, setForm] = useState(EMPTY);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        setFormError("");
    };

    // Multi-select attendees
    const toggleAttendee = (id) => {
        setForm((p) => ({
            ...p,
            addUsers: p.addUsers.includes(id)
                ? p.addUsers.filter((u) => u !== id)
                : [...p.addUsers, id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.describtion || !form.day || !form.startTime || !form.endTime) {
            return setFormError("Please fill in all required fields.");
        }
        if (form.typeOfMeeting === "online" && !form.zoomLink) {
            return setFormError("Zoom link is required for online meetings.");
        }
        setSubmitting(true);
        setFormError("");
        try {
            await createMeeting({
                ...form,
                creatorId: user._id,
                role: user.role,
                // zoomLink only sent for online meetings
                ...(form.typeOfMeeting !== "online" && { zoomLink: undefined }),
            });
            setForm(EMPTY);
            setShowForm(false);
            refetch();
            showToast("Meeting scheduled successfully.");
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Failed to create meeting.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this meeting?")) return;
        setDeletingId(id);
        try {
            await deleteMeeting(id, user._id);
            refetch();
            showToast("Meeting deleted.");
        } catch {
            showToast("Failed to delete meeting.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="Meetings"
                subtitle="Schedule and manage team meetings."
                action={
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setShowForm((v) => !v)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={15} /> {showForm ? "Cancel" : "Schedule Meeting"}
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

            {/* ── Create form ────────────────────────────────────────────── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="card-soft">
                            <div className="flex items-center gap-2 mb-5">
                                <Video size={17} className="text-primary" />
                                <h2 className="font-semibold text-slate-800">New Meeting</h2>
                            </div>

                            {formError && (
                                <div className="alert alert-error py-2 text-sm mb-4">
                                    <AlertCircle size={14} /> {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Title *</span>
                                        </label>
                                        <input type="text" name="title" value={form.title} onChange={handleChange}
                                            placeholder="Meeting title"
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Sub Title</span>
                                        </label>
                                        <input type="text" name="subTitle" value={form.subTitle} onChange={handleChange}
                                            placeholder="Optional subtitle"
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-medium text-slate-600">Description *</span>
                                    </label>
                                    <textarea name="describtion" value={form.describtion} onChange={handleChange}
                                        placeholder="What is this meeting about?"
                                        rows={2}
                                        className="textarea textarea-bordered textarea-sm bg-white focus:border-primary resize-none" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Date *</span>
                                        </label>
                                        <input type="date" name="day" value={form.day} onChange={handleChange}
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Start Time *</span>
                                        </label>
                                        <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange}
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">End Time *</span>
                                        </label>
                                        <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange}
                                            className="input input-bordered input-sm bg-white focus:border-primary" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Meeting Type</span>
                                        </label>
                                        <select name="typeOfMeeting" value={form.typeOfMeeting} onChange={handleChange}
                                            className="select select-bordered select-sm bg-white focus:border-primary capitalize">
                                            {MEETING_TYPES.map((t) => <option key={t} className="capitalize">{t}</option>)}
                                        </select>
                                    </div>
                                    {form.typeOfMeeting === "online" && (
                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-medium text-slate-600">Zoom Link *</span>
                                            </label>
                                            <input type="url" name="zoomLink" value={form.zoomLink} onChange={handleChange}
                                                placeholder="https://zoom.us/j/..."
                                                className="input input-bordered input-sm bg-white focus:border-primary" />
                                        </div>
                                    )}
                                </div>

                                {/* Attendees multi-select */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-medium text-slate-600">
                                            Invite Attendees
                                            {form.addUsers.length > 0 && (
                                                <span className="ml-2 badge badge-primary badge-xs">{form.addUsers.length} selected</span>
                                            )}
                                        </span>
                                    </label>
                                    <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto bg-white space-y-1">
                                        {employees.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-2">Loading users…</p>
                                        ) : (
                                            employees.map((emp) => (
                                                <label key={emp._id}
                                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.addUsers.includes(emp._id)}
                                                        onChange={() => toggleAttendee(emp._id)}
                                                        className="checkbox checkbox-primary checkbox-xs"
                                                    />
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                                        {emp.user_name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-slate-700 truncate">{emp.user_name}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{emp.email}</p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="btn btn-ghost btn-sm flex-1 border border-slate-200">
                                        Cancel
                                    </button>
                                    <motion.button type="submit" disabled={submitting}
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary btn-sm flex-1">
                                        {submitting
                                            ? <span className="loading loading-spinner loading-xs" />
                                            : <><Video size={14} /> Schedule Meeting</>
                                        }
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Meetings list ──────────────────────────────────────────── */}
            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <Video size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">My Scheduled Meetings</h2>
                    {!loading && meetings && (
                        <span className="badge badge-primary badge-sm ml-auto">{meetings.length} total</span>
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
                ) : !meetings || meetings.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                        <Video size={36} className="opacity-30" />
                        <p className="text-sm">No meetings scheduled yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {meetings.map((m) => (
                            <motion.div key={m._id}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                                className="flex items-start justify-between gap-4 p-4 rounded-xl
                                           border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
                                        <span className={`badge badge-xs capitalize ${m.typeOfMeeting === "online" ? "badge-primary" : "badge-ghost"}`}>
                                            {m.typeOfMeeting}
                                        </span>
                                    </div>
                                    {m.subTitle && <p className="text-xs text-slate-500 mt-0.5">{m.subTitle}</p>}
                                    <div className="flex gap-4 mt-1.5 text-xs text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} /> {new Date(m.day).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={11} /> {m.addUsers?.length ?? 0} attendees
                                        </span>
                                        {m.zoomLink && (
                                            <a href={m.zoomLink} target="_blank" rel="noreferrer"
                                                className="text-primary hover:underline truncate max-w-[200px]">
                                                Join Zoom
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    disabled={deletingId === m._id}
                                    onClick={() => handleDelete(m._id)}
                                    className="btn btn-ghost btn-xs text-error hover:bg-red-50 shrink-0">
                                    {deletingId === m._id
                                        ? <span className="loading loading-spinner loading-xs" />
                                        : <Trash2 size={13} />
                                    }
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
