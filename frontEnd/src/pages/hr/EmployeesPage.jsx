import { motion } from "framer-motion";
import { Users, AlertCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import useApi from "../../hooks/useApi";
import { getAllUsers } from "../../api/services/userService";

const ROLE_BADGE = { Admin: "badge-error", HR: "badge-warning", Employee: "badge-success" };

export default function EmployeesPage() {
    const { data: users, loading, error } = useApi(getAllUsers);

    const employees = users?.filter((u) => u.role === "Employee") ?? [];

    return (
        <div>
            <PageHeader
                title="Employee List"
                subtitle="View all employees and their salary details."
            />

            <div className="card-soft">
                <div className="flex items-center gap-2 mb-5">
                    <Users size={17} className="text-primary" />
                    <h2 className="font-semibold text-slate-700">Employees</h2>
                    {!loading && (
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
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wide">
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Basic Salary</th>
                                    <th>Total Salary</th>
                                    <th>Role</th>
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
                                        <td className="font-medium text-slate-800">{u.user_name}</td>
                                        <td className="text-slate-500 text-sm">{u.email}</td>
                                        <td className="text-slate-500 text-sm">{u.phone}</td>
                                        <td className="text-sm">{u.basicSalary?.toLocaleString() ?? "—"} EGP</td>
                                        <td className="text-sm font-semibold text-primary">
                                            {u.totalSalary?.toLocaleString() ?? "—"} EGP
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm ${ROLE_BADGE[u.role] ?? "badge-ghost"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {employees.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-10">No employees found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
