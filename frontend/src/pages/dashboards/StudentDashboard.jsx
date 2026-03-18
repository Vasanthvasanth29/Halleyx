import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ModernDropdown from '../../components/ModernDropdown';
import { 
    Layout, 
    Play, 
    FileText, 
    CheckCircle, 
    Clock, 
    X, 
    Send,
    LogOut,
    User as UserIcon,
    ClipboardList,
    AlertCircle,
    Loader2,
    Check,
    ArrowRight,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExecutionTimeline from '../../components/ExecutionTimeline';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');

    const [activeTab, setActiveTab] = useState('available'); // 'available', 'submissions'
    const [submissions, setSubmissions] = useState([]);
    const [availableWorkflows, setAvailableWorkflows] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal State
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
            const [subsRes, wfRes] = await Promise.all([
                api.get(`/api/admin/executions?initiatorUserId=${userId}`).catch(() => ({ data: [] })),
                api.get(`/api/admin/workflows/available?userId=${userId}&categoryFilter=STUDENT`).catch(() => ({ data: [] }))
            ]);
            setSubmissions(subsRes.data || []);
            setAvailableWorkflows(wfRes.data || []);
        } catch (err) {
            setError('Failed to sync student dashboard data.');
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
            setFormData({
                requestType: 'LEAVE',
                days: '',
                reason: ''
            });
            setShowStartModal(true);
        } catch (err) {
            setError('Failed to load workflow fields.');
        }
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/api/admin/workflows/${selectedWf.workflow.id}/execute`, {
                initiatorUserId: userId,
                inputs: {
                    requestType: formData.requestType,
                    fromDate: formData.fromDate,
                    toDate: formData.toDate,
                    days: formData.days ? parseInt(formData.days) : undefined,
                    reason: formData.reason
                }
            });
            setSuccessMsg('Leave/OD Request Submitted Successfully');
            setShowStartModal(false);
            fetchData();
            setActiveTab('submissions');
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
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
            {/* Header */}
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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Student Dashboard</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>HalleyX Portal</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="premium-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Logout
                </button>
            </header>

            {successMsg && (
                <div className="premium-alert alert-success animate-slide-up" style={{ marginBottom: '24px' }}>
                    <CheckCircle size={18} /> {successMsg}
                </div>
            )}

            {error && (
                <div className="premium-alert alert-danger animate-slide-up" style={{ marginBottom: '24px' }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Tabs */}
            <div className="premium-tabs">
                <button 
                    className={`premium-tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    Available Workflows
                </button>
                <button 
                    className={`premium-tab ${activeTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submissions')}
                >
                    My Requests
                </button>
            </div>

            {/* Content Area */}
            <main>
                {activeTab === 'available' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Start a New Request</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {availableWorkflows.length > 0 ? availableWorkflows.map(wf => (
                                <div key={wf.id} className="glass-card premium-hover" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{wf.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', height: '40px', overflow: 'hidden' }}>
                                        {wf.description || 'Apply for leave or OD permission through this workflow.'}
                                    </p>
                                    <button onClick={() => openStartModal(wf)} className="premium-btn" style={{ width: '100%' }}>
                                        <Send size={16} /> Apply Now
                                    </button>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No student workflows available at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Submission History</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Track the status of your submitted applications</p>
                        
                        <div className="premium-table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Workflow</th>
                                        <th>Current Step</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.length > 0 ? submissions.map(ex => (
                                        <tr key={ex.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, color: '#fff' }}>{ex.workflow.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>{ex.workflow.category}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                                    {ex.currentStep?.stepName || 'Final Review'}
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(ex.status)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(ex.startedAt).toLocaleDateString()}</td>
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
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No requests submitted yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Start Modal (Specific for Student) */}
            {showStartModal && selectedWf && (
                <div className="auth-wrapper" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{selectedWf.workflow.name} Application</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Fill in your request details</p>
                            </div>
                            <button onClick={() => setShowStartModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInitialSubmit}>
                            <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
                                <div>
                                    <label className="auth-label">Request Type *</label>
                                    <ModernDropdown
                                        options={[
                                            { label: 'Leave', value: 'LEAVE' },
                                            { label: 'OD Permission', value: 'OD' }
                                        ]}
                                        value={formData.requestType || ''}
                                        onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                                        placeholder="Select Type"
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="auth-label">Start Date *</label>
                                        <input 
                                            type="date"
                                            className="premium-input"
                                            required
                                            value={formData.fromDate || ''}
                                            onChange={e => setFormData({...formData, fromDate: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="auth-label">End Date *</label>
                                        <input 
                                            type="date"
                                            className="premium-input"
                                            required
                                            value={formData.toDate || ''}
                                            onChange={e => setFormData({...formData, toDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="auth-label">Number of Days *</label>
                                    <input 
                                        type="number"
                                        className="premium-input"
                                        required
                                        min="1"
                                        value={formData.days || ''}
                                        onChange={e => setFormData({...formData, days: e.target.value})}
                                        placeholder="Enter number of days"
                                    />
                                </div>
                                <div>
                                    <label className="auth-label">Reason *</label>
                                    <textarea 
                                        className="premium-input"
                                        required
                                        style={{ minHeight: '80px', paddingTop: '12px' }}
                                        value={formData.reason || ''}
                                        onChange={e => setFormData({...formData, reason: e.target.value})}
                                        placeholder="Brief reason for your request..."
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={() => setShowStartModal(false)} className="premium-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button disabled={submitting} type="submit" className="premium-btn" style={{ flex: 2 }}>
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
                                </button>
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
                            <h2 style={{ margin: 0 }}>Request Progress</h2>
                            <button onClick={() => setShowProgressModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                            <ExecutionTimeline executionId={selectedExecutionId} />
                        </div>
                        <div style={{ marginTop: '32px' }}>
                            <button onClick={() => setShowProgressModal(false)} className="premium-btn" style={{ width: '100%' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
