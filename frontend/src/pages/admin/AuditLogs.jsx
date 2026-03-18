import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { FileLock2, Search, Hash, User, Calendar, Activity, Filter, ChevronLeft, ChevronRight, ListOrdered } from 'lucide-react';
import ModernDropdown from '../../components/ModernDropdown';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters
    const [searchUsername, setSearchUsername] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAction, setSelectedAction] = useState('');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size,
                username: searchUsername,
                category: selectedCategory,
                actionType: selectedAction
            };
            const res = await api.get('/api/admin/audit-logs', { params });
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, size, searchUsername, selectedCategory, selectedAction]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [fetchLogs]);

    const getStatusStyle = (status) => {
        const base = { padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em' };
        if (status === 'SUCCESS') return { ...base, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
        return { ...base, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>System Audit Logs</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time monitoring of all critical system transactions and user activities.</p>
            </header>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '2', minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="premium-input" 
                        style={{ paddingLeft: '48px', height: '48px' }} 
                        placeholder="Search security traces by user..." 
                        value={searchUsername}
                        onChange={(e) => { setSearchUsername(e.target.value); setPage(0); }}
                    />
                </div>
                
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Filter style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} size={18} />
                    <ModernDropdown 
                        style={{ paddingLeft: '48px' }}
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
                        options={[
                            { label: 'All Domains', value: '' },
                            { label: 'Student Domain', value: 'student_workflow' },
                            { label: 'Expense Domain', value: 'expense_workflow' },
                            { label: 'Employee Domain', value: 'employee_task_workflow' },
                            { label: 'System General', value: 'GENERAL' }
                        ]}
                    />
                </div>

                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Activity style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} size={18} />
                    <ModernDropdown 
                        style={{ paddingLeft: '48px' }}
                        value={selectedAction}
                        onChange={(e) => { setSelectedAction(e.target.value); setPage(0); }}
                        options={[
                            { label: 'All Activities', value: '' },
                            { label: 'User Auth', value: 'USER_REGISTRATION' },
                            { label: 'Logic Config', value: 'WORKFLOW_CREATED' },
                            { label: 'Flow Initiation', value: 'EXECUTION_STARTED' },
                            { label: 'Actor Decision', value: 'ACTION_PERFORMED' },
                            { label: 'Flow Termination', value: 'WORKFLOW_COMPLETED' }
                        ]}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ModernDropdown 
                        style={{ minWidth: '120px' }}
                        value={size.toString()}
                        onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                        options={[
                            { label: '10 / Page', value: '10' },
                            { label: '25 / Page', value: '25' },
                            { label: '50 / Page', value: '50' }
                        ]}
                    />
                </div>
            </div>

            {loading && logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Synchronizing security ledger...</div>
            ) : logs.length === 0 ? (
                <div className="glass-effect" style={{ padding: '80px', textAlign: 'center', borderRadius: '24px' }}>
                    <FileLock2 size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No audit traces found for these criteria.</h3>
                </div>
            ) : (
                <>
                    <div className="premium-table-container">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Operator</th>
                                    <th>Domain</th>
                                    <th>Protocol & Description</th>
                                    <th style={{ textAlign: 'center' }}>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                                <Calendar size={14} className="sub-gradient" />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '800', color: '#fff' }}>{log.performerName}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{log.performedByRole}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="premium-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
                                                {log.workflowCategory?.replace(/_/g, ' ').toUpperCase() || 'SYSTEM'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{log.actionType.replace(/_/g, ' ')}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '300px' }}>{log.actionDescription}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge status-${log.status === 'SUCCESS' ? 'completed' : 'rejected'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Showing <strong>{page * size + 1}</strong> to <strong>{Math.min((page + 1) * size, totalElements)}</strong> of <strong>{totalElements}</strong> entries
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                disabled={page === 0} 
                                onClick={() => setPage(page - 1)}
                                className="premium-btn" 
                                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
                            </div>
                            <button 
                                disabled={page >= totalPages - 1} 
                                onClick={() => setPage(page + 1)}
                                className="premium-btn" 
                                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
            
            <style>{`
                .hover-row:hover { background: rgba(255,255,255,0.02); }
            `}</style>
        </div>
    );
};

const thStyle = { padding: '16px 24px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em' };

export default AuditLogs;
