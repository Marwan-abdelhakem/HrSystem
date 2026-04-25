import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Plus, Pencil, Trash2, X, AlertCircle, CheckCircle2,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import { getAllUsers, createUser, deleteUser } from "../../api/services/userService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_BADGE = { Admin: "badge-error", HR: "badge-warning", Employee: "badge-success" };

const EMPTY_FORM = {
    user_name: "", email: "", password: "", phone: "",
    role: "Employee", basicSalary: "", housingAllowance: "",
    transportationAllowance: "", otherAllowance: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const { data: users, loading, error, refetch } = useApi(getAllUsers);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.user_name || !form.email || !form.password || !form.phone || !form.basicSalary) {
            return setFormError("Please fill in all required fields.");
        }
        setFormLoading(true);
        setFormError("");
        try {
            await createUser(form);
            setModalOpen(false);
            setForm(EMPTY_FORM);
            refetch();
            showToast("Employee created successfully.");
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Failed to create user.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
        try {
            await deleteUser(id);
            refetch();
            showToast(`${name} deleted.`, "info");
        } catch {
            showToast("Failed to delete user.", "error");
        }
    };

    return (
        <div>
            <PageHeader
                title="User Management"
                subtitle="Create, view, and manage all system users."
                action={
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setModalOpen(true)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={15} /> Add Employee
                    </motion.button>
                }
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`alert mb-5 py-3 text-sm ${toast.type === "error" ? "alert-error" : toast.type === "info" ? "alert-info" : "alert-success"}`}
                    >
                        <CheckCircle2 size={15} /> {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table card */}
            <div className="card-soft">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner text-primary loading-md" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-error py-8 justify-center text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Total Salary</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map((u) => (
                                    <motion.tr
                                        key={u._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="font-medium text-slate-800">{u.user_name}</td>
                                        <td className="text-slate-500 text-sm">{u.email}</td>
                                        <td className="text-slate-500 text-sm">{u.phone}</td>
                                        <td>
                                            <span className={`badge badge-sm ${ROLE_BADGE[u.role] ?? "badge-ghost"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="text-sm font-medium">
                                            {u.totalSalary?.toLocaleString() ?? "—"} EGP
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleDelete(u._id, u.user_name)}
                                                    className="btn btn-ghost btn-xs text-error hover:bg-red-50"
                                                    aria-label="Delete user"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {users?.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-10">No users found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30"
                            onClick={() => setModalOpen(false)}
                        />
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                {/* Modal header */}
                                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-primary" />
                                        <h2 className="font-semibold text-slate-800">Add New Employee</h2>
                                    </div>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="btn btn-ghost btn-sm btn-square"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Modal body */}
                                <form onSubmit={handleCreate} className="p-6 space-y-4">
                                    {formError && (
                                        <div className="alert alert-error py-2 text-sm">
                                            <AlertCircle size={14} /> {formError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { name: "user_name", label: "Full Name *", type: "text", placeholder: "John Doe" },
                                            { name: "email", label: "Email *", type: "email", placeholder: "john@company.com" },
                                            { name: "password", label: "Password *", type: "password", placeholder: "Min. 6 chars" },
                                            { name: "phone", label: "Phone *", type: "tel", placeholder: "+20 100 000 0000" },
                                            { name: "basicSalary", label: "Basic Salary *", type: "number", placeholder: "5000" },
                                            { name: "housingAllowance", label: "Housing Allowance", type: "number", placeholder: "0" },
                                            { name: "transportationAllowance", label: "Transport Allowance", type: "number", placeholder: "0" },
                                            { name: "otherAllowance", label: "Other Allowance", type: "number", placeholder: "0" },
                                        ].map(({ name, label, type, placeholder }) => (
                                            <div key={name} className="form-control">
                                                <label className="label py-1">
                                                    <span className="label-text text-xs font-medium text-slate-600">{label}</span>
                                                </label>
                                                <input
                                                    type={type}
                                                    name={name}
                                                    value={form[name]}
                                                    onChange={handleChange}
                                                    placeholder={placeholder}
                                                    className="input input-bordered input-sm bg-white focus:border-primary"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Role */}
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-medium text-slate-600">Role *</span>
                                        </label>
                                        <select
                                            name="role"
                                            value={form.role}
                                            onChange={handleChange}
                                            className="select select-bordered select-sm bg-white focus:border-primary"
                                        >
                                            <option value="Employee">Employee</option>
                                            <option value="HR">HR</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setModalOpen(false)}
                                            className="btn btn-ghost btn-sm flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            type="submit"
                                            disabled={formLoading}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn btn-primary btn-sm flex-1"
                                        >
                                            {formLoading ? <span className="loading loading-spinner loading-xs" /> : "Create Employee"}
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
