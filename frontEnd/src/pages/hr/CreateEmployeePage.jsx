import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus, User, Mail, Lock, Phone,
    DollarSign, CheckCircle2, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { createEmployee } from "../../api/services/userService";

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY = {
    user_name: "",
    email: "",
    password: "",
    phone: "",
    basicSalary: "",
    housingAllowance: "",
    transportationAllowance: "",
    otherAllowance: "",
};

// ─── Field config ─────────────────────────────────────────────────────────────

const TEXT_FIELDS = [
    { name: "user_name", label: "Full Name *", type: "text", placeholder: "e.g. Ahmed Mohamed", icon: User },
    { name: "email", label: "Email *", type: "email", placeholder: "ahmed@company.com", icon: Mail },
    { name: "phone", label: "Phone *", type: "tel", placeholder: "+20 100 000 0000", icon: Phone },
];

const SALARY_FIELDS = [
    { name: "basicSalary", label: "Basic Salary *", placeholder: "e.g. 8000" },
    { name: "housingAllowance", label: "Housing Allowance", placeholder: "e.g. 1000" },
    { name: "transportationAllowance", label: "Transport Allowance", placeholder: "e.g. 500" },
    { name: "otherAllowance", label: "Other Allowance", placeholder: "e.g. 0" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateEmployeePage() {
    const [form, setForm] = useState(EMPTY);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Live total salary preview
    const totalSalary =
        (Number(form.basicSalary) || 0) +
        (Number(form.housingAllowance) || 0) +
        (Number(form.transportationAllowance) || 0) +
        (Number(form.otherAllowance) || 0);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        setError("");
        setSuccess(false);
    };

    const validate = () => {
        if (!form.user_name.trim()) return "Full name is required.";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required.";
        if (form.password.length < 6) return "Password must be at least 6 characters.";
        if (!form.phone.trim()) return "Phone number is required.";
        if (!form.basicSalary || Number(form.basicSalary) <= 0) return "Basic salary is required.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return setError(err);

        setLoading(true);
        setError("");
        try {
            await createEmployee(form);
            setSuccess(true);
            setForm(EMPTY);
            // Auto-clear success after 4s
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to create employee.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Create Employee"
                subtitle="Add a new employee to the system. Their role will be set to Employee."
            />

            <div className="max-w-2xl">
                {/* Success banner */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="alert alert-success mb-6 py-3"
                        >
                            <CheckCircle2 size={18} />
                            <div>
                                <p className="font-semibold text-sm">Employee created successfully!</p>
                                <p className="text-xs opacity-80">They can now log in with their email and password.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="card-soft">
                    {/* Role lock notice */}
                    <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <UserPlus size={16} className="text-primary shrink-0" />
                        <p className="text-sm text-primary font-medium">
                            Role is locked to <span className="font-bold">Employee</span> — HR cannot create Admin or HR accounts.
                        </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="alert alert-error mb-5 py-3 text-sm"
                            >
                                <AlertCircle size={15} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">

                        {/* ── Personal info ──────────────────────────────── */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                                Personal Information
                            </p>
                            <div className="space-y-3">
                                {TEXT_FIELDS.map(({ name, label, type, placeholder, icon: Icon }) => (
                                    <div key={name} className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium text-slate-700">{label}</span>
                                        </label>
                                        <label className="input input-bordered flex items-center gap-2 bg-white focus-within:border-primary">
                                            <Icon size={15} className="text-slate-400 shrink-0" />
                                            <input
                                                type={type}
                                                name={name}
                                                value={form[name]}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                                className="grow text-sm"
                                                autoComplete={name === "email" ? "email" : "off"}
                                            />
                                        </label>
                                    </div>
                                ))}

                                {/* Password */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-sm font-medium text-slate-700">Password *</span>
                                    </label>
                                    <label className="input input-bordered flex items-center gap-2 bg-white focus-within:border-primary">
                                        <Lock size={15} className="text-slate-400 shrink-0" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Min. 6 characters"
                                            className="grow text-sm"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                            aria-label={showPassword ? "Hide" : "Show"}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ── Salary ─────────────────────────────────────── */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                                Salary Details
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SALARY_FIELDS.map(({ name, label, placeholder }) => (
                                    <div key={name} className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium text-slate-700">{label}</span>
                                        </label>
                                        <label className="input input-bordered flex items-center gap-2 bg-white focus-within:border-primary">
                                            <DollarSign size={14} className="text-slate-400 shrink-0" />
                                            <input
                                                type="number"
                                                name={name}
                                                value={form[name]}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                                min="0"
                                                className="grow text-sm"
                                            />
                                            <span className="text-xs text-slate-400 shrink-0">EGP</span>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            {/* Live total */}
                            <div className="mt-3 flex items-center justify-between px-4 py-3
                                            bg-emerald-50 border border-emerald-200 rounded-xl">
                                <span className="text-sm font-medium text-emerald-700">Total Salary</span>
                                <span className="text-lg font-bold text-emerald-700">
                                    {totalSalary.toLocaleString()} EGP
                                </span>
                            </div>
                        </div>

                        {/* ── Submit ─────────────────────────────────────── */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-primary w-full gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <><UserPlus size={16} /> Create Employee</>
                            )}
                        </motion.button>
                    </form>
                </div>
            </div>
        </div>
    );
}
