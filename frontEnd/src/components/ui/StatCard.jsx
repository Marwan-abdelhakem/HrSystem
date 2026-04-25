import { motion } from "framer-motion";

/**
 * A reusable stat card for dashboards.
 *
 * Props:
 *   title   : string
 *   value   : string | number
 *   icon    : React element
 *   color   : tailwind bg class for the icon bubble  (default "bg-primary/10")
 *   iconColor: tailwind text class                   (default "text-primary")
 *   trend   : optional string shown below the value
 */
export default function StatCard({ title, value, icon, color = "bg-primary/10", iconColor = "text-primary", trend }) {
    return (
        <motion.div
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
            transition={{ duration: 0.2 }}
            className="card-soft flex items-start gap-4"
        >
            <div className={`${color} ${iconColor} p-3 rounded-xl shrink-0`}>
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">
                    {title}
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
                {trend && (
                    <p className="text-xs text-slate-400 mt-1">{trend}</p>
                )}
            </div>
        </motion.div>
    );
}
