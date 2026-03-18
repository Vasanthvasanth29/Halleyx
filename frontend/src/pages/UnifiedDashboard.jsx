import React, { useState, useEffect } from 'react';
import api from '../api/axios';
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

const UnifiedDashboard = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');

    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'submissions', 'available'
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [availableWorkflows, setAvailableWorkflows] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal State
    const [showStartModal, setShowStartModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedWf, setSelectedWf] = useState(null);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [formData, setFormData] = useState({});
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksRes, subsRes, wfRes] = await Promise.all([
                api.get(`/api/admin/executions?currentHandlerUserId=${userId}`),
                api.get(`/api/admin/executions?initiatorUserId=${userId}`),
                api.get('/api/admin/workflows?status=ACTIVE')
            ]);
            setTasks(tasksRes.data || []);
            setSubmissions(subsRes.data || []);
            setAvailableWorkflows(wfRes.data.content || []);
        } catch (err) {
            setError('Failed to sync dashboard data.');
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
            await api.post(`/api/admin/workflows/${selectedWf.workflow.id}/execute`, { inputs: formData });
            setSuccessMsg('Request Submitted Successfully');
            setShowStartModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Unified Dashboard</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>HalleyX Workflow v3.0</p>
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

            {/* Tabs */}
            <div className="premium-tabs">
                {['tasks', 'submissions', 'available'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`premium-tab ${activeTab === tab ? 'active' : ''}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === 'tasks' && tasks.length > 0 && (
                            <span style={{ 
                                marginLeft: '8px', background: 'var(--primary)', color: 'white', 
                                fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px',
                                boxShadow: '0 0 10px var(--primary-glow)'
                            }}>
                                {tasks.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <main>
                {activeTab === 'tasks' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Tasks Requiring Action</h2>
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
                                    <button 
                                        onClick={() => openActionModal(ex)}
                                        className="premium-btn" 
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        Handle Task <ArrowRight size={18} />
                                    </button>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>You're all caught up! No tasks assigned.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>My Workflow Requests</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Track requests initiated by you</p>
                        
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
                                                    {ex.currentStep?.stepName || 'End'}
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(ex.status)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(ex.startedAt).toLocaleDateString()}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    {ex.status === 'REJECTED' && (
                                                        <button 
                                                            onClick={() => openActionModal(ex)}
                                                            className="action-link"
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                        >
                                                            Resubmit
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => { setSelectedExecution(ex); setShowActionModal(true); /* Note: ExecutionTimeline link needed if separate */ }}
                                                        className="action-link"
                                                    >
                                                        <Layout size={14} /> Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No submissions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'available' && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Available Workflows</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {availableWorkflows.map(wf => (
                                <div key={wf.id} className="glass-card premium-hover" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{wf.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', height: '40px', overflow: 'hidden' }}>
                                        {wf.description}
                                    </p>
                                    <button onClick={() => openStartModal(wf)} className="premium-btn" style={{ width: '100%' }}>
                                        <Send size={16} /> Start Process
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Action Modal */}
            {showActionModal && selectedExecution && (
                <div className="auth-wrapper" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Workflow Action</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{selectedExecution.workflow.name} - {selectedExecution.currentStep?.stepName}</p>
                            </div>
                            <button onClick={() => setShowActionModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="auth-input-group" style={{ marginBottom: '32px' }}>
                            {selectedExecution.workflow?.category?.toLowerCase().includes('student') && (
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', 
                                    marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' 
                                }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>Request Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                                            <div style={{ fontWeight: '700' }}>{selectedExecution.requestType}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Leave Days:</span>
                                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedExecution.leaveDays} Days</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>From:</span>
                                            <div>{selectedExecution.fromDate}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>To:</span>
                                            <div>{selectedExecution.toDate}</div>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Reason:</span>
                                            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>"{selectedExecution.reason}"</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedExecution.workflow?.category?.toLowerCase().includes('expense') && (
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', 
                                    marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' 
                                }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>Expense Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                                            <div style={{ fontWeight: '700', color: '#10b981', fontSize: '1.2rem' }}>
                                                ${selectedExecution.expenseAmount?.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                                            <div style={{ fontWeight: '700' }}>{selectedExecution.expenseType}</div>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Description:</span>
                                            <div style={{ marginTop: '4px' }}>{selectedExecution.expenseDescription}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="auth-label"><MessageSquare size={14} /> Comments (Optional)</label>
                            <textarea 
                                className="premium-input" 
                                style={{ minHeight: '80px', paddingTop: '12px' }}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Details about your decision..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {selectedExecution.status === 'REJECTED' ? (
                                <button 
                                    disabled={submitting}
                                    onClick={() => handleAction('SUBMIT')}
                                    className="premium-btn" 
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Finalize & Resubmit</>}
                                </button>
                            ) : (
                                (selectedExecution.currentStep?.allowedActions || '').split(',').map(act => {
                                    const isReject = act.trim().toUpperCase() === 'REJECT';
                                    return (
                                        <button 
                                            key={act}
                                            disabled={submitting}
                                            onClick={() => handleAction(act.trim())}
                                            className={isReject ? "premium-btn-secondary" : "premium-btn"} 
                                            style={{ 
                                                flex: 1, 
                                                color: isReject ? '#ef4444' : 'inherit', 
                                                borderColor: isReject ? '#ef444440' : undefined,
                                                minWidth: '140px'
                                            }}
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    {isReject ? <X size={20} /> : <Check size={20} />} 
                                                    {act.trim().charAt(0) + act.trim().slice(1).toLowerCase()}
                                                </>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Start Modal (Dynamic) */}
            {showStartModal && selectedWf && (
                <div className="auth-wrapper" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Initialize {selectedWf.workflow.name}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Category: {selectedWf.workflow.category}</p>
                            </div>
                            <button onClick={() => setShowStartModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInitialSubmit}>
                            <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
                                {selectedWf.workflow?.category?.toLowerCase().includes('student') ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="auth-label">Request Type *</label>
                                                <select 
                                                    className="premium-input"
                                                    required
                                                    value={formData.requestType || ''}
                                                    onChange={e => setFormData({...formData, requestType: e.target.value})}
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="Leave">Leave</option>
                                                    <option value="OD">OD Permission</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="auth-label">Leave Days *</label>
                                                <input 
                                                    type="number"
                                                    className="premium-input"
                                                    required
                                                    min="1"
                                                    value={formData.leaveDays || ''}
                                                    onChange={e => setFormData({...formData, leaveDays: e.target.value})}
                                                    placeholder="Enter Days"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="auth-label">From Date *</label>
                                                <input 
                                                    type="date"
                                                    className="premium-input"
                                                    required
                                                    value={formData.fromDate || ''}
                                                    onChange={e => setFormData({...formData, fromDate: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="auth-label">To Date *</label>
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
                                    </>
                                ) : (
                                    (selectedWf.inputFields || []).map(field => (
                                        <div key={field.id} style={{ marginBottom: '16px' }}>
                                            <label className="auth-label">{field.fieldName} {field.required && '*'}</label>
                                            {field.fieldType === 'DROPDOWN' ? (
                                                <select 
                                                    className="premium-input"
                                                    required={field.required}
                                                    value={formData[field.fieldName] || ''}
                                                    onChange={e => setFormData({...formData, [field.fieldName]: e.target.value})}
                                                >
                                                    <option value="">Select {field.fieldName}</option>
                                                    {(field.allowedValues || '').split(',').map(val => (
                                                        <option key={val.trim()} value={val.trim()}>{val.trim()}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input 
                                                    type={field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'DATE' ? 'date' : 'text'}
                                                    className="premium-input" 
                                                    required={field.required}
                                                    value={formData[field.fieldName] || ''}
                                                    onChange={e => setFormData({...formData, [field.fieldName]: e.target.value})}
                                                    placeholder={`Enter ${field.fieldName}`}
                                                />
                                            )}
                                        </div>
                                    ))
                                )}
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
        </div>
    );
};

export default UnifiedDashboard;
