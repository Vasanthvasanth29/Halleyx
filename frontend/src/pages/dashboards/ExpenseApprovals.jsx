import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    CheckCircle, 
    X, 
    LogOut,
    User as UserIcon,
    Loader2,
    Check,
    ArrowRight,
    MessageSquare,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExecutionTimeline from '../../components/ExecutionTimeline';

const ExpenseApprovalDashboard = ({ roleName, title }) => {
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

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Primary: fetch by currentHandlerUserId
            const res = await api.get(`/api/admin/executions?currentHandlerUserId=${userId}`);
            
            // Strict Isolation: Show ONLY Expense Workflow tasks for this dashboard
            const pending = (res.data || []).filter(ex => 
                ex.status === 'IN_PROGRESS'
            );
            setTasks(pending);
        } catch (err) {
            setError(`Failed to sync ${title} data.`);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        setSubmitting(true);
        try {
            await api.post(`/api/admin/executions/${selectedExecution.id}/action`, {
                action,
                comment
            });
            setSuccessMsg(`✅ ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully`);
            setShowActionModal(false);
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed. Please try again.');
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
                padding: '24px 32px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                        <UserIcon color="white" size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{title} Dashboard</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Expense Approval Panel</p>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Approvals Queue</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Review and process pending workflow requests</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {tasks.length} PENDING
                    </div>
                </div>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                    {tasks.length > 0 ? tasks.map(ex => (
                        <div key={ex.id} className="glass-card premium-hover animate-fade-in" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'white', background: 'var(--primary)', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                                        {ex.workflow?.category?.replace('_WORKFLOW', '') || 'REQUEST'}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>
                                        ID: {ex.id.slice(0, 8)}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 8px 0', color: '#fff' }}>{ex.workflow?.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: '600' }}>
                                        <Clock size={14} className="sub-gradient" /> {ex.currentStep?.stepName}
                                    </div>
                                    <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        Initiated by: <span style={{ color: 'white', fontWeight: '600' }}>{ex.initiatorUserId || 'System'}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setSelectedExecution(ex); setComment(''); setShowActionModal(true); }} 
                                className="premium-btn" 
                                style={{ padding: '12px 24px', fontSize: '0.9rem', width: 'auto' }}
                            >
                                Review Request <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <CheckCircle size={32} color="#10b981" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>All Caught Up!</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>There are no pending expense claims or requests awaiting your approval at this time.</p>
                        </div>
                    )}
                </div>
            </main>

            {showActionModal && selectedExecution && (
                <div className="auth-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '640px', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: '800' }}>Review Intel</h2>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                    {selectedExecution.workflow?.category?.replace('_WORKFLOW', '')} Protocol
                                </p>
                            </div>
                            <button onClick={() => setShowActionModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '12px' }}><X size={24} /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Workflow Entity</span>
                                <div style={{ fontWeight: '700', marginTop: '4px', fontSize: '1rem' }}>{selectedExecution.workflow?.name}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Decision Node</span>
                                <div style={{ fontWeight: '700', marginTop: '4px', color: 'var(--primary)', fontSize: '1rem' }}>{selectedExecution.currentStep?.stepName}</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(139, 92, 246, 0.03)', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Data Payloads</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem' }}>
                                {selectedExecution.expenseAmount != null && (
                                    <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Funding Required</span>
                                        <div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.5rem' }}>
                                            ₹{selectedExecution.expenseAmount?.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                )}
                                {selectedExecution.expenseType && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Classification</span>
                                        <div style={{ fontWeight: '700', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>{selectedExecution.expenseType}</div>
                                    </div>
                                )}
                                {selectedExecution.requestType && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Request Class</span>
                                        <div style={{ fontWeight: '700', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>{selectedExecution.requestType}</div>
                                    </div>
                                )}
                                {selectedExecution.leaveDays != null && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Duration</span>
                                        <div style={{ fontWeight: '700' }}>{selectedExecution.leaveDays} Units</div>
                                    </div>
                                )}
                                {selectedExecution.expenseDescription && (
                                    <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contextual Description</span>
                                        <div style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>{selectedExecution.expenseDescription}</div>
                                    </div>
                                )}
                                {selectedExecution.reason && (
                                    <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Execution Rationale</span>
                                        <div style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>{selectedExecution.reason}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Timeline Enhancement */}
                        <div style={{ marginBottom: '40px' }}>
                            <ExecutionTimeline executionId={selectedExecution.id} />
                        </div>

                        <div className="auth-input-group" style={{ marginBottom: '32px' }}>
                            <label className="auth-label"><MessageSquare size={14} /> Intelligence Feedback (Optional)</label>
                            <textarea className="premium-input" style={{ minHeight: '100px', paddingTop: '16px' }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Provide rationale for your decision..." />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button disabled={submitting} onClick={() => handleAction('REJECT')} className="premium-btn-secondary" style={{ flex: 1, color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '16px' }}>
                                Reject Protocol
                            </button>
                            <button disabled={submitting} onClick={() => handleAction('APPROVE')} className="premium-btn" style={{ flex: 1.5, padding: '16px' }}>
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Action'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ManagerDashboard = () => <ExpenseApprovalDashboard roleName="MANAGER" title="Manager" />;
export const FinanceDashboard = () => <ExpenseApprovalDashboard roleName="FINANCE" title="Finance" />;
export const CEODashboard = () => <ExpenseApprovalDashboard roleName="CEO" title="CEO" />;
export const HRDashboard = () => <ExpenseApprovalDashboard roleName="HR" title="HR" />;
