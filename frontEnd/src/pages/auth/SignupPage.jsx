import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";

const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const INITIAL_FORM = {
    user_name: "",
    email: "",
    password: "",
    phone: "",
    role: "Employee",
};

export default function SignupPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const validate = () => {
        if (!form.user_name.trim()) return "Full name is required.";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
            return "Enter a valid email address.";
        if (form.password.length < 6) return "Password must be at least 6 characters.";
        if (!form.phone.trim()) return "Phone number is required.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) return setError(validationError);

        setLoading(true);
        try {
            await api.post("/api/auth/signUp", form);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message ?? "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                <div className="card-soft">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-slate-800">
                            HR<span className="text-primary">System</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Create your account</p>
                    </div>

                    {/* Success state */}
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-3 py-8 text-center"
                        >
                            <CheckCircle2 size={48} className="text-success" />
                            <p className="font-semibold text-slate-700">Account created!</p>
                            <p className="text-sm text-slate-500">Redirecting you to login…</p>
                        </motion.div>
                    ) : (
                        <>
                            {/* Error alert */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="alert alert-error mb-5 py-3 text-sm"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                {/* Full name */}
                                <div className="form-control">
                                    <label className="label pb-1">
                                        <span className="label-text font-medium text-slate-700">Full Name</span>
                                    </label>
                                    <label className="input input-bordered flex items-center gap-2 bg-white focus-within:border-primary">
                                        <User size={15} className="text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            name="user_name"
                                            value={form.user_name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="grow text-sm"
                                        />
                                    </label>
                                </div>

                                {/* Email */}
                                <div className="form-control">
                                    <label className="label pb-1">
                                        <span className="label-text font-medium text-slate-700">Email</span>
                                    </label>
                                    <label className="input input-bordered flex items-center gap-2 bg-white focus-within:border-primary">
                                        <Mail size={15} className="text-slate-400 shrink-0" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@company.com"
                                            className="grow text-sm"
                                            autoComplete="email"
                                        />
                                    </label>
                                </div>

                                {/* Password */}
                                <div className="form-control">
                                    <label className="label pb-1">
                                        <span className="label-text font-medium text-slate-700">Password</span>
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
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </label>
                                </div>

                                {/* Phone */}
                                <div className="form-control">
                                    <label className="label pb-1">
                                        <span className="label-text font-medium text-slate-700">Phone</span>
                                    </label>
                                    <label className="input input-bordered flex items-center gap-2 bg-white focus-within:border-primary">
                                        <Phone size={15} className="text-slate-400 shrink-0" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+20 100 000 0000"
                                            className="grow text-sm"
                                        />
                                    </label>
                                </div>

                                {/* Role selector */}
                                <div className="form-control">
                                    <label className="label pb-1">
                                        <span className="label-text font-medium text-slate-700">Role</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="select select-bordered bg-white focus:border-primary text-sm"
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-primary w-full mt-2"
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        "Create Account"
                                    )}
                                </motion.button>
                            </form>

                            <p className="text-center text-sm text-slate-500 mt-6">
                                Already have an account?{" "}
                                <Link to="/login" className="text-primary font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
