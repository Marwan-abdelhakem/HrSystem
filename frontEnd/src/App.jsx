import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import RoleRedirect from "./components/guards/RoleRedirect";

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage from "./pages/auth/LoginPage";

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import CreateJobPage from "./pages/admin/CreateJobPage";
import CreateMeetingPage from "./pages/admin/CreateMeetingPage";

// ── HR ────────────────────────────────────────────────────────────────────────
import HRDashboard from "./pages/dashboards/HRDashboard";
import EmployeesPage from "./pages/hr/EmployeesPage";
import CreateEmployeePage from "./pages/hr/CreateEmployeePage";
import LeaveRequestsPage from "./pages/hr/LeaveRequestsPage";
import TaskAssignmentPage from "./pages/hr/TaskAssignmentPage";

// ── Employee ──────────────────────────────────────────────────────────────────
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import MyTasksPage from "./pages/employee/MyTasksPage";
import MyRequestsPage from "./pages/employee/MyRequestsPage";
import NewRequestPage from "./pages/employee/NewRequestPage";

// ── Misc ──────────────────────────────────────────────────────────────────────
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
    return (
        <Routes>
            {/* ── Public ──────────────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ── Authenticated shell ──────────────────────────────────── */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>

                    {/* / → role-specific home */}
                    <Route index element={<RoleRedirect />} />

                    {/* ── Admin ─────────────────────────────────────────────── */}
                    <Route element={<ProtectedRoute roles={["Admin"]} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<UsersPage />} />
                        <Route path="/admin/tasks" element={<AdminTasksPage />} />
                        <Route path="/admin/jobs" element={<CreateJobPage />} />
                        <Route path="/admin/meetings" element={<CreateMeetingPage />} />
                    </Route>

                    {/* ── HR ────────────────────────────────────────────────── */}
                    <Route element={<ProtectedRoute roles={["HR"]} />}>
                        <Route path="/hr" element={<HRDashboard />} />
                        <Route path="/hr/employees" element={<EmployeesPage />} />
                        <Route path="/hr/create" element={<CreateEmployeePage />} />
                        <Route path="/hr/leave" element={<LeaveRequestsPage />} />
                        <Route path="/hr/tasks" element={<TaskAssignmentPage />} />
                    </Route>

                    {/* ── Employee ──────────────────────────────────────────── */}
                    <Route element={<ProtectedRoute roles={["Employee"]} />}>
                        <Route path="/employee" element={<EmployeeDashboard />} />
                        <Route path="/employee/tasks" element={<MyTasksPage />} />
                        <Route path="/employee/requests" element={<MyRequestsPage />} />
                        <Route path="/employee/request" element={<NewRequestPage />} />
                    </Route>

                </Route>
            </Route>

            {/* ── Fallback ────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
