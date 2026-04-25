import { motion } from "framer-motion";
import { Users, AlertCircle, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import { getEmployees } from "../../api/services/userService";

export default function EmployeesPage() {
    // getEmployees is accessible to both Admin and HR
    const { data: employees, loading, error } = useApi(getEmployees);

    return (
        <div>
            <PageHeader
                title="Employee List"
                subtitle="All employees in the system."
                action={
                    <Link to="/hr/create" className="btn btn-primary btn-sm gap-2">
                        <UserPlus size={15} /> Create Employee
                    </Link>
                }
            />

            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <Users size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">Employees</h2>
                    {!loading && employees && (
                        <span className="badge badge-primary badge-sm ml-auto">{employees.length}</span>
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
                ) : !employees || employees.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-14 text-slate-400">
                        <Users size={40} className="opacity-30" />
                        <p className="text-sm">No employees yet.</p>
                        <Link to="/hr/create" className="btn btn-primary btn-sm gap-2">
                            <UserPlus size={14} /> Create First Employee
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((u, i) => (
                                    <motion.tr
                                        key={u._id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="text-slate-400 text-xs">{i + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary
                                                                flex items-center justify-center text-xs font-bold shrink-0">
                                                    {u.user_name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-800 text-sm">{u.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="text-slate-500 text-sm">{u.email}</td>
                                        <td className="text-slate-500 text-sm">{u.phone ?? "—"}</td>
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
