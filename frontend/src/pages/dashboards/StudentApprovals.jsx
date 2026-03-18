import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    CheckCircle, 
    Clock, 
    X, 
    LogOut,
    User as UserIcon,
    AlertCircle,
    Loader2,
    Check,
    ArrowRight,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApprovalDashboard = ({ roleName, title }) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/executions?role=${roleName}`);
            setTasks(res.data || []);
        } catch (err) {
            setError(`Failed to sync ${title} data.`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openActionModal = (ex) => {
        setSelectedExecution(ex);
        setComment('');
        setShowActionModal(true);
    };

    const handleAction = async (action) => {
        setSubmitting(true);
        try {
            await api.post(`/api/admin/executions/${selectedExecution.id}/action`, {
                action,
                comment
            });
            setSuccessMsg(`Action ${action} Processed`);
            setShowActionModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed.');
        } finally {
            setSubmitting(false);
        }
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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{title} Dashboard</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Approvals Control</p>
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

            <main>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Pending Approvals ({tasks.length})</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {tasks.length > 0 ? tasks.map(ex => (
                        <div key={ex.id} className="glass-card premium-hover" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    {ex.workflow.category}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>{ex.workflow.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Current Step: <strong style={{ color: 'white' }}>{ex.currentStep?.stepName}</strong>
                                </p>
                            </div>
                            <button onClick={() => openActionModal(ex)} className="premium-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Review Request <ArrowRight size={18} />
                            </button>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>All caught up! No tasks pending your approval.</p>
                        </div>
                    )}
                </div>
            </main>

            {showActionModal && selectedExecution && (
                <div className="auth-wrapper" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Review Request</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{selectedExecution.workflow.name}</p>
                            </div>
                            <button onClick={() => setShowActionModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>Application Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                                    <div style={{ fontWeight: '700' }}>{selectedExecution.requestType}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedExecution.leaveDays} Days</div>
                                </div>
                                <div><span style={{ color: 'var(--text-muted)' }}>From:</span><div>{selectedExecution.fromDate}</div></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>To:</span><div>{selectedExecution.toDate}</div></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Reason:</span>
                                    <div style={{ marginTop: '4px' }}>"{selectedExecution.reason}"</div>
                                </div>
                            </div>
                        </div>

                        <div className="auth-input-group" style={{ marginBottom: '32px' }}>
                            <label className="auth-label"><MessageSquare size={14} /> Approval Comments</label>
                            <textarea 
                                className="premium-input" 
                                style={{ minHeight: '80px', paddingTop: '12px' }}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="State reason for approval or rejection..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button 
                                disabled={submitting}
                                onClick={() => handleAction('REJECT')}
                                className="premium-btn-secondary" 
                                style={{ flex: 1, color: '#ef4444', borderColor: '#ef444440' }}
                            >
                                <X size={20} /> Reject
                            </button>
                            <button 
                                disabled={submitting}
                                onClick={() => handleAction('APPROVE')}
                                className="premium-btn" 
                                style={{ flex: 2 }}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Approve Request</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AdvisorDashboard = () => <ApprovalDashboard roleName="ADVISOR" title="Advisor" />;
export const HODDashboard = () => <ApprovalDashboard roleName="HOD" title="HOD" />;
export const PrincipalDashboard = () => <ApprovalDashboard roleName="PRINCIPAL" title="Principal" />;
