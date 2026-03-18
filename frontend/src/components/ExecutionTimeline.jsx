import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, CheckCircle, XCircle, Clock, User, MessageSquare } from 'lucide-react';

const ExecutionTimeline = ({ executionId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (executionId) {
            fetchLogs();
        }
    }, [executionId]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/executions/${executionId}/logs`);
            setLogs(res.data || []);
        } catch (err) {
            setError('Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={24} color="var(--primary)" />
        </div>
    );

    if (error) return <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>;
    if (logs.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No history available.</div>;

    return (
        <div className="timeline-container" style={{ marginTop: '10px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Workflow Intelligence History
            </h4>
            <div style={{ display: 'grid', gap: '0' }}>
                {logs.map((log, index) => {
                    const isReject = log.actionType === 'REJECT';
                    const isStart = index === logs.length - 1;
                    return (
                        <div key={log.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                            {/* Timeline Line */}
                            {index !== logs.length - 1 && (
                                <div style={{ 
                                    position: 'absolute', left: '11px', top: '28px', bottom: '-4px', 
                                    width: '2px', background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.2), transparent)' 
                                }} />
                            )}
                            
                            {/* Icon / Dot */}
                            <div style={{ 
                                width: '24px', height: '24px', borderRadius: '50%', 
                                background: isReject ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${isReject ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`,
                                zIndex: 1,
                                boxShadow: isReject ? 'none' : '0 0 10px rgba(139, 92, 246, 0.2)'
                            }}>
                                {isReject ? <XCircle size={14} color="#f87171" /> : <CheckCircle size={14} color="var(--primary)" />}
                            </div>
    
                            {/* Content */}
                            <div style={{ flex: 1, paddingBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>
                                            {log.stepName || 'Submission Initiated'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                                            {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className={`status-badge status-${isReject ? 'rejected' : 'completed'}`} style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                                        {log.actionType}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                                    <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                        <User size={12} className="sub-gradient" />
                                    </div>
                                    <span style={{ fontWeight: '600' }}>{log.performerName}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({log.performerRole})</span>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>processed this stage</span>
                                </div>
    
                                {log.comments && (
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', 
                                        fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid var(--glass-border)',
                                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                                        marginLeft: '-4px'
                                    }}>
                                        <MessageSquare size={14} style={{ marginTop: '3px', color: 'var(--primary)', opacity: 0.7 }} />
                                        <span style={{ lineHeight: '1.6' }}>{log.comments}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExecutionTimeline;
