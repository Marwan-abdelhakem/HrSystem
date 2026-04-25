import { motion } from "framer-motion";
import { ShieldOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <ShieldOff size={56} className="text-error mx-auto mb-4 opacity-70" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500 text-sm mb-6">
                    You don't have permission to view this page.
                </p>
                <Link to="/" className="btn btn-primary btn-sm">
                    Go to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}
