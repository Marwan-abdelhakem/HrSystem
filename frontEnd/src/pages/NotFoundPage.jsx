import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
            >
                <p className="text-8xl font-black text-slate-100 select-none">404</p>
                <SearchX size={48} className="text-slate-300 mx-auto -mt-4 mb-4" />
                <h1 className="text-xl font-bold text-slate-700 mb-2">Page not found</h1>
                <p className="text-slate-400 text-sm mb-6">
                    The page you're looking for doesn't exist or was moved.
                </p>
                <Link to="/" className="btn btn-primary btn-sm">
                    Back to Home
                </Link>
            </motion.div>
        </div>
    );
}
