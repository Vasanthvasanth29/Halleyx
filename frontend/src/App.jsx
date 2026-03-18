import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardStats from './pages/admin/DashboardStats';
import CreateWorkflow from './pages/admin/CreateWorkflow';
import UserMapping from './pages/admin/UserMapping';
import AuditLogs from './pages/admin/AuditLogs';
import StepBuilder from './pages/admin/StepBuilder';
import WorkflowLibrary from './pages/admin/WorkflowLibrary';
import { AdvisorDashboard, HODDashboard, PrincipalDashboard } from './pages/dashboards/StudentApprovals';
import { ManagerDashboard, FinanceDashboard, CEODashboard, HRDashboard } from './pages/dashboards/ExpenseApprovals';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';

const LoginWrapper = () => {
  const navigate = useNavigate();
  const handleSwitch = () => navigate('/register');
  return <Login onSwitch={handleSwitch} />;
};

const RegisterWrapper = () => {
  const navigate = useNavigate();
  const handleSwitch = () => navigate('/login');
  return <Register onSwitch={handleSwitch} />;
};

const LegacyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/workflow-builder/${id}`} replace />;
};

function App() {
  console.log("App Version 4.0.1 - Role-Based Dashboards Active");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardStats />} />
            <Route path="workflows" element={<Navigate to="/admin/workflow-library" replace />} />
            <Route path="workflow-library" element={<WorkflowLibrary />} />
            <Route path="create-workflow" element={<CreateWorkflow />} />
            <Route path="workflow-builder/:id" element={<StepBuilder />} />
            <Route path="workflows/:id/steps" element={<LegacyRedirect />} />
            <Route path="user-mapping" element={<UserMapping />} />
            <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Role-Based Dashboards */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/advisor-dashboard" element={<AdvisorDashboard />} />
        <Route path="/hod-dashboard" element={<HODDashboard />} />
        <Route path="/principal-dashboard" element={<PrincipalDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/finance-dashboard" element={<FinanceDashboard />} />
        <Route path="/ceo-dashboard" element={<CEODashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />

        {/* Default / Fallback */}
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
