import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import ModernDropdown from '../../components/ModernDropdown';
import { 
    Plus, 
    Trash2, 
    GitMerge, 
    Edit3, 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    Layers,
    BookOpen,
    ShieldCheck,
    Zap,
    Play,
    MoreVertical,
    FileText,
    Rocket,
    RotateCcw
} from 'lucide-react';

const thStyle = { padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '0.1em' };

const WorkflowLibrary = () => {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    
    // Filtering and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/workflows', {
                params: {
                    name: searchTerm,
                    category: categoryFilter,
                    page: page,
                    size: pageSize
                }
            });
            let allWorkflows = res.data?.content || [];
            
            if (statusFilter !== 'ALL') {
                allWorkflows = allWorkflows.filter(wf => wf.status === statusFilter);
            }

            setWorkflows(allWorkflows);
            setTotalPages(res.data?.totalPages || 0);
        } catch (err) {
            console.error("Library Sync Failure:", err);
            setWorkflows([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, categoryFilter, statusFilter, page, pageSize]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchWorkflows();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchWorkflows]);

    const handleExecute = async (id) => {
        setExecuting(id);
        try {
            await api.post(`/api/admin/workflows/${id}/execute`);
            alert("Workflow execution started");
        } catch (err) {
            alert(err.response?.data?.message || "Startup failure.");
        } finally {
            setExecuting(null);
            setActiveMenu(null);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/api/admin/workflows/${id}/toggle-status`);
            fetchWorkflows();
        } catch (err) {
            alert("Status toggle failed: " + (err.response?.data?.message || err.message));
        } finally {
            setActiveMenu(null);
        }
    };

    const handleEdit = (wf) => {
        navigate(`/admin/workflow-builder/${wf.id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this workflow blueprint?")) return;
        try {
            await api.delete(`/api/admin/workflows/${id}`);
            alert("Workflow deleted successfully.");
            fetchWorkflows();
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.message || err.message));
        } finally {
            setActiveMenu(null);
        }
    };

    return (
        <div className="animate-fade-in" onClick={() => setActiveMenu(null)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Workflow Library</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage, edit, and execute your automated process blueprints.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/create-workflow')}
                    className="premium-btn"
                    style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={20} /> Create New Blueprint
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search blueprint name or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="premium-input"
                        style={{ paddingLeft: '48px', height: '48px' }}
                    />
                </div>
                <div style={{ minWidth: '220px', position: 'relative' }}>
                    <Filter style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} size={18} />
                    <ModernDropdown 
                        value={categoryFilter} 
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                        style={{ paddingLeft: '48px' }}
                        options={[
                            { label: 'All Categories', value: 'ALL' },
                            { label: 'Student Workflow', value: 'STUDENT_WORKFLOW' },
                            { label: 'Employee Workflow', value: 'EMPLOYEE_WORKFLOW' },
                            { label: 'Expense Workflow', value: 'EXPENSE_WORKFLOW' },
                            { label: 'Employee Task Workflow', value: 'EMPLOYEE_TASK_WORKFLOW' }
                        ]}
                    />
                </div>
                <div style={{ minWidth: '180px', position: 'relative' }}>
                    <ShieldCheck style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} size={18} />
                    <ModernDropdown 
                        value={statusFilter} 
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        style={{ paddingLeft: '48px' }}
                        options={[
                            { label: 'All Status', value: 'ALL' },
                            { label: 'Draft', value: 'DRAFT' },
                            { label: 'Active', value: 'ACTIVE' }
                        ]}
                    />
                </div>
            </div>

            {loading && workflows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading library catalog...</div>
            ) : workflows.length === 0 ? (
                <div className="glass-effect" style={{ padding: '80px', textAlign: 'center', borderRadius: '24px' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
                    <h3 style={{ marginBottom: '8px' }}>Library is Empty</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Initialize your first logic to see it here.</p>
                </div>
            ) : (
                <>
                <div className="premium-table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Workflow Name</th>
                                <th>Category</th>
                                <th>Nodes</th>
                                <th>Version</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workflows.map(wf => (
                                <tr key={wf.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <GitMerge size={18} />
                                            </div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>{wf.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {wf.category?.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                            <Layers size={14} className="sub-gradient" /> {wf.stepCount} Steps
                                        </div>
                                    </td>
                                    <td>
                                        <span className="premium-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>v{wf.version}.0</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${wf.status === 'ACTIVE' ? 'completed' : 'pending'}`}>
                                            {wf.status === 'ACTIVE' ? <Rocket size={12} /> : <FileText size={12} />}
                                            {wf.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleExecute(wf.id); }}
                                                disabled={wf.status !== 'ACTIVE' || executing === wf.id}
                                                className="action-link"
                                                style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                                            >
                                                <Play size={14} /> Run
                                            </button>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEdit(wf); }}
                                                className="action-link"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(wf.id); }}
                                                className="action-link"
                                                style={{ 
                                                    color: wf.status === 'ACTIVE' ? '#eab308' : '#a78bfa',
                                                    background: wf.status === 'ACTIVE' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(167, 139, 250, 0.1)',
                                                    borderColor: wf.status === 'ACTIVE' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                                }}
                                            >
                                                {wf.status === 'ACTIVE' ? <RotateCcw size={14} /> : <Zap size={14} />}
                                                {wf.status === 'ACTIVE' ? 'Draft' : 'Publish'}
                                            </button>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(wf.id); }}
                                                className="action-link"
                                                style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '8px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Showing page <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{page + 1}</span> of <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{totalPages || 1}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="glass-effect" style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', opacity: page === 0 ? 0.3 : 1 }}>
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="glass-effect" style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', opacity: page >= totalPages - 1 ? 0.3 : 1 }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
                </>
            )}

            <style>{`
                .hover-row:hover { background: rgba(255,255,255,0.02); }
                .workflow-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .workflow-action-btn:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.08);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                .workflow-action-btn:active {
                    transform: translateY(0);
                }
                .workflow-action-btn.execute { color: #10b981; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); }
                .workflow-action-btn.edit { color: var(--primary); border-color: rgba(99, 102, 241, 0.3); background: rgba(99, 102, 241, 0.05); }
                .workflow-action-btn.delete { color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.05); padding: 8px; }
                
                .workflow-action-btn:disabled {
                    opacity: 0.2;
                    cursor: not-allowed;
                    transform: none;
                }
            `}</style>
        </div>
    );
};

export default WorkflowLibrary;
