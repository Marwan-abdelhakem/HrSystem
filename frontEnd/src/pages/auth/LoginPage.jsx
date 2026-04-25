import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const ROLE_HOME = { Admin: "/admin", HR: "/hr", Employee: "/employee" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const validate = () => {
        if (!form.email.trim()) return "Email is required.";
        if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
        if (!form.password) return "Password is required.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) return setError(validationError);

        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/login", form);
            const { accessToken, user } = data.data;

            setAuth({ token: accessToken, user });
            navigate(ROLE_HOME[user.role] ?? "/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ?? "Login failed. Please check your credentials."
            );
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
                {/* Card */}
                <div className="card-soft">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-slate-800">
                            HR<span className="text-primary">System</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
                    </div>

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

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                                    placeholder="••••••••"
                                    className="grow text-sm"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </label>
                        </div>

                        {/* Submit */}
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
                                "Sign In"
                            )}
                        </motion.button>
                    </form>

                    {/* Footer — no public signup, accounts are created by HR/Admin */}
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Contact your HR department to get an account.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
