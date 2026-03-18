import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    CheckCircle, 
    Clock, 
    X, 
    Send,
    LogOut,
    User as UserIcon,
    AlertCircle,
    Loader2,
    Check,
    ArrowRight,
    MessageSquare,
    AlertTriangle,
    Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExecutionTimeline from '../../components/ExecutionTimeline';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [activeTab, setActiveTab] = useState('available');
    const [submissions, setSubmissions] = useState([]);
    const [availableWorkflows, setAvailableWorkflows] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [showStartModal, setShowStartModal] = useState(false);
    const [selectedWf, setSelectedWf] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedExecutionId, setSelectedExecutionId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subsRes, expenseWfRes, employeeWfRes] = await Promise.all([
                api.get(`/api/admin/executions?initiatorUserId=${userId}`).catch(() => ({ data: [] })),
                api.get(`/api/admin/workflows/available?userId=${userId}&categoryFilter=EXPENSE`).catch(() => ({ data: [] })),
                api.get(`/api/admin/workflows/available?userId=${userId}&categoryFilter=EMPLOYEE`).catch(() => ({ data: [] }))
            ]);
            setSubmissions(subsRes.data || []);
            setAvailableWorkflows([...(expenseWfRes.data || []), ...(employeeWfRes.data || [])]);
        } catch (err) {
            setError('Failed to sync employee dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openStartModal = async (wf) => {
        try {
            const res = await api.get(`/api/admin/workflows/${wf.id}`);
            setSelectedWf(res.data);
            const initial = {};
            (res.data.inputFields || []).forEach(f => initial[f.fieldName] = '');
            setFormData(initial);
            setShowStartModal(true);
        } catch (err) {
            setError('Failed to load workflow fields.');
        }
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const processedInputs = {};
            (selectedWf.inputFields || []).forEach(field => {
                const raw = formData[field.fieldName];
                if (field.fieldType === 'NUMBER' && raw !== '' && raw !== undefined) {
                    processedInputs[field.fieldName] = parseFloat(raw);
                } else {
                    processedInputs[field.fieldName] = raw;
                }
            });

            // Compatibility: Ensure both 'amount' and 'expenseAmount' are set if either exists
            if (processedInputs.expenseAmount !== undefined) processedInputs.amount = processedInputs.expenseAmount;
            if (processedInputs.amount !== undefined) processedInputs.expenseAmount = processedInputs.amount;

            const endpoint = `/api/admin/workflows/${selectedWf.workflow.id}/execute`;
            
            await api.post(endpoint, {
                workflowId: selectedWf.workflow.id,
                initiatorUserId: userId,
                inputs: processedInputs
            });
            
            setSuccessMsg('Request Submitted Successfully');
            setShowStartModal(false);
            fetchData();
            setActiveTab('submissions');
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusClass = status?.toLowerCase().replace('_', '-');
        return (
            <span className={`status-badge status-${statusClass || 'pending'}`}>
                {status === 'COMPLETED' ? <CheckCircle size={12} /> : 
                 status === 'REJECTED' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                {status}
            </span>
        );
    };

    if (loading) return (
        <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    return (
        <div className="admin-container animate-fade-in" style={{ padding: '24px 40px' }}>
            <header style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px',
                padding: '24px 32px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                        <UserIcon color="white" size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Employee Portal</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Expense & Task Management</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="premium-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="premium-tabs">
                <button 
                    className={`premium-tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    Available Benefits
                </button>
                <button 
                    className={`premium-tab ${activeTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submissions')}
                >
                    My Claims
                </button>
            </div>

            <main>
                {activeTab === 'available' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Available Workflows</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {availableWorkflows.length > 0 ? availableWorkflows.map(wf => (
                                <div key={wf.id} className="glass-card premium-hover" style={{ padding: '24px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', letterSpacing: '1px' }}>
                                        {wf.category}
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{wf.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', minHeight: '40px' }}>
                                        {wf.description || 'Submit and track your request.'}
                                    </p>
                                    <button onClick={() => openStartModal(wf)} className="premium-btn" style={{ width: '100%', gap: '8px' }}>
                                        <Send size={16} /> {wf.category === 'EXPENSE_WORKFLOW' ? 'File Expense Claim' : 'Submit Request'}
                                    </button>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No workflows available. Ensure your user is mapped to a workflow.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Claim History</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Monitor and track your expense reimbursements</p>

                        <div className="premium-table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Workflow</th>
                                        <th>Category</th>
                                        <th>Step</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.length > 0 ? submissions.map(ex => (
                                        <tr key={ex.id}>
                                            <td><div style={{ fontWeight: 700, color: '#fff' }}>{ex.workflow?.name}</div></td>
                                            <td><span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>{ex.workflow?.category?.replace('_WORKFLOW','')}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                                    {ex.currentStep?.stepName || 'Final Review'}
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(ex.status)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(ex.startedAt || Date.now()).toLocaleDateString()}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => { setSelectedExecutionId(ex.id); setShowProgressModal(true); }}
                                                    className="action-link"
                                                >
                                                    <Layout size={14} /> View Progress
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No submissions yet. Start a claim from the Available Benefits tab.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {showStartModal && selectedWf && (
                <div className="auth-wrapper" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{selectedWf?.workflow?.name || 'New Request'}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Fill in the details below</p>
                            </div>
                            <button onClick={() => setShowStartModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInitialSubmit}>
                            <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
                                {(selectedWf.inputFields || []).map(field => (
                                    <div key={field.id}>
                                        <label className="auth-label">{field.fieldName} {field.required && '*'}</label>
                                        {field.fieldType === 'DROPDOWN' ? (
                                            <ModernDropdown
                                                options={(field.allowedValues || '').split(',').map(v => ({ label: v.trim(), value: v.trim() }))}
                                                value={formData[field.fieldName] || ''}
                                                onChange={(e) => setFormData({...formData, [field.fieldName]: e.target.value})}
                                                placeholder={`Select ${field.fieldName}`}
                                                required={field.required}
                                            />
                                        ) : (
                                            <input type={field.fieldType === 'NUMBER' ? 'number' : 'text'} className="premium-input" required={field.required} value={formData[field.fieldName] || ''} onChange={e => setFormData({...formData, [field.fieldName]: e.target.value})} placeholder={`Enter ${field.fieldName}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={() => setShowStartModal(false)} className="premium-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button disabled={submitting} type="submit" className="premium-btn" style={{ flex: 2 }}>Submit Claim</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Progress Modal */}
            {showProgressModal && (
                <div className="auth-wrapper" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Progress Tracker</h2>
                            <button onClick={() => setShowProgressModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '12px' }}>
                            <ExecutionTimeline executionId={selectedExecutionId} />
                        </div>
                        <div style={{ marginTop: '32px' }}>
                            <button onClick={() => setShowProgressModal(false)} className="premium-btn" style={{ width: '100%' }}>Dismiss</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
