import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Trash2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getAllJobs, createJob, deleteJob } from "../../api/services/jobService";

// ─── Config ───────────────────────────────────────────────────────────────────

const JOB_TYPES = ["Full Time", "Part Time", "Remote"];
const GENDERS = ["male", "female"];
const STATUSES = ["pending", "approved", "rejected"];

const EMPTY = {
    name: "", title: "", range_salary: "", experince: "",
    typeOfJobs: "Full Time", description: "", skills: "",
    qualification: "", gender: "male", status: "pending",
};

const STATUS_BADGE = {
    pending: "badge-warning",
    approved: "badge-success",
    rejected: "badge-error",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateJobPage() {
    const { user } = useAuth();
    const { data: jobs, loading, error, refetch } = useApi(getAllJobs);

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

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const required = ["name", "title", "range_salary", "experince", "description", "skills", "qualification"];
        if (required.some((k) => !form[k].trim())) {
            return setFormError("Please fill in all required fields.");
        }
        setSubmitting(true);
        setFormError("");
        try {
            await createJob({ ...form, creatorId: user._id });
            setForm(EMPTY);
            setShowForm(false);
            refetch();
            showToast("Job posted successfully.");
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Failed to create job.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this job posting?")) return;
        setDeletingId(id);
        try {
            await deleteJob(id, user._id);
            refetch();
            showToast("Job deleted.");
        } catch {
            showToast("Failed to delete job.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="Job Postings"
                subtitle="Create and manage open positions in your organization."
                action={
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowForm((v) => !v)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={15} /> {showForm ? "Cancel" : "Post a Job"}
                    </motion.button>
                }
            />

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

            {/* ── Create form (collapsible) ──────────────────────────────── */}
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
                                <Briefcase size={17} className="text-primary" />
                                <h2 className="font-semibold text-slate-800">New Job Posting</h2>
                            </div>

                            {formError && (
                                <div className="alert alert-error py-2 text-sm mb-4">
                                    <AlertCircle size={14} /> {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { name: "name", label: "Company / Dept Name *", placeholder: "e.g. Engineering" },
                                        { name: "title", label: "Job Title *", placeholder: "e.g. Frontend Developer" },
                                        { name: "range_salary", label: "Salary Range *", placeholder: "e.g. 8,000 – 12,000 EGP" },
                                        { name: "experince", label: "Experience Required *", placeholder: "e.g. 2+ years" },
                                        { name: "skills", label: "Required Skills *", placeholder: "e.g. React, Node.js" },
                                        { name: "qualification", label: "Qualification *", placeholder: "e.g. Bachelor's in CS" },
                                    ].map(({ name, label, placeholder }) => (
                                        <div key={name} className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-medium text-slate-600">{label}</span>
                                            </label>
                                            <input
                                                type="text"
                                                name={name}
                                                value={form[name]}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                                className="input input-bordered input-sm bg-white focus:border-primary"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Description — full width */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-medium text-slate-600">Description *</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe the role and responsibilities…"
                                        rows={3}
                                        className="textarea textarea-bordered textarea-sm bg-white focus:border-primary resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Job type */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Job Type</span>
                                        </label>
                                        <select name="typeOfJobs" value={form.typeOfJobs} onChange={handleChange}
                                            className="select select-bordered select-sm bg-white focus:border-primary">
                                            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    {/* Gender */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Gender</span>
                                        </label>
                                        <select name="gender" value={form.gender} onChange={handleChange}
                                            className="select select-bordered select-sm bg-white focus:border-primary capitalize">
                                            {GENDERS.map((g) => <option key={g} className="capitalize">{g}</option>)}
                                        </select>
                                    </div>
                                    {/* Status */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Status</span>
                                        </label>
                                        <select name="status" value={form.status} onChange={handleChange}
                                            className="select select-bordered select-sm bg-white focus:border-primary capitalize">
                                            {STATUSES.map((s) => <option key={s} className="capitalize">{s}</option>)}
                                        </select>
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
                                            : <><Briefcase size={14} /> Post Job</>
                                        }
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Jobs list ──────────────────────────────────────────────── */}
            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <Briefcase size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">All Job Postings</h2>
                    {!loading && jobs && (
                        <span className="badge badge-primary badge-sm ml-auto">{jobs.length} total</span>
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
                ) : !jobs || jobs.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                        <Briefcase size={36} className="opacity-30" />
                        <p className="text-sm">No job postings yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Salary Range</th>
                                    <th>Experience</th>
                                    <th>Gender</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <motion.tr key={job._id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors">
                                        <td>
                                            <p className="font-medium text-slate-800 text-sm">{job.title}</p>
                                            <p className="text-xs text-slate-400">{job.name}</p>
                                        </td>
                                        <td className="text-sm text-slate-600">{job.typeOfJobs}</td>
                                        <td className="text-sm text-slate-600">{job.range_salary}</td>
                                        <td className="text-sm text-slate-600">{job.experince}</td>
                                        <td className="text-sm capitalize text-slate-600">{job.gender}</td>
                                        <td>
                                            <span className={`badge badge-sm capitalize ${STATUS_BADGE[job.status] ?? "badge-ghost"}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                disabled={deletingId === job._id}
                                                onClick={() => handleDelete(job._id)}
                                                className="btn btn-ghost btn-xs text-error hover:bg-red-50">
                                                {deletingId === job._id
                                                    ? <span className="loading loading-spinner loading-xs" />
                                                    : <Trash2 size={13} />
                                                }
                                            </motion.button>
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
