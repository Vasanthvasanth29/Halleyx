import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Workflow, PlayCircle, Users, Clock, CheckCircle, ArrowUpRight, Activity, Calendar } from 'lucide-react';

const DashboardStats = () => {
    const [stats, setStats] = useState({ 
        totalWorkflows: 0, 
        totalExecutions: 0, 
        activeUsers: 0, 
        pendingApprovals: 0, 
        completedExecutions: 0 
    });
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, c, t, r] = await Promise.all([
                    api.get('/api/admin/dashboard/summary').then(res => res.data),
                    api.get('/api/admin/dashboard/category-distribution').then(res => res.data),
                    api.get('/api/admin/dashboard/execution-history').then(res => res.data),
                    api.get('/api/admin/dashboard/recent-activity').then(res => res.data)
                ]);
                setStats(s);
                setCategoryData(c);
                setTrendData(t.sort((a, b) => new Date(a.date) - new Date(b.date)));
                setRecentActivity(r);
            } catch (err) {
                console.error("Dashboard Fetch Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ color: 'var(--text-muted)', paddingTop: '100px', textAlign: 'center' }}>Synchronizing control center...</div>;

    const getStatusStyle = (status) => {
        const base = { padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800' };
        if (status === 'SUCCESS') return { ...base, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
        return { ...base, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '48px' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Executive Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Command center for workflow orchestrations and system intelligence.</p>
            </header>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <StatCard title="Blueprints" value={stats.totalWorkflows} icon={<Workflow />} color="var(--primary)" />
                <StatCard title="Active Flows" value={stats.totalExecutions} icon={<PlayCircle />} color="#3b82f6" />
                <StatCard title="Success Rate" value={stats.completedExecutions} icon={<CheckCircle />} color="#10b981" />
                <StatCard title="In Review" value={stats.pendingApprovals} icon={<Clock />} color="#f59e0b" />
                <StatCard title="Global Users" value={stats.activeUsers} icon={<Users />} color="#ec4899" />
            </div>

            {/* Graphs Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '48px' }}>
                <ChartPanel title="Workflow Category Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Execution Volume Trend">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="executions" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>

            {/* Recent Activity Table */}
            <div className="premium-table-container">
                <div style={{ padding: '32px 32px 12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity size={20} className="text-secondary" /> Activity Stream
                    </h3>
                    <button className="action-link" onClick={() => window.location.href='/admin/audit-logs'}>
                        Full History <ArrowUpRight size={14} />
                    </button>
                </div>

                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Operator</th>
                            <th>Domain</th>
                            <th>Action</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map(log => (
                            <tr key={log.id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', color: '#fff' }}>{log.performerName}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>{log.performedByRole}</div>
                                </td>
                                <td>
                                    <span className="premium-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
                                        {log.workflowCategory?.replace(/_/g, ' ').toUpperCase() || 'SYSTEM'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{log.actionType.replace(/_/g, ' ')}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`status-badge status-${log.status === 'SUCCESS' ? 'completed' : 'rejected'}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {recentActivity.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ opacity: 0.3, marginBottom: '12px' }}><Activity size={40} /></div>
                                    <p style={{ color: 'var(--text-muted)' }}>No recent activity detected.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .hover-row:hover { background: rgba(255,255,255,0.02); }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-effect glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', border: `1px solid ${color}20` }}>
        <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.1, color: color }}>
            {React.cloneElement(icon, { size: 100 })}
        </div>
        <div style={{ color: color, marginBottom: '16px', display: 'flex', background: `${color}15`, width: 'fit-content', padding: '10px', borderRadius: '12px' }}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.025em', textTransform: 'uppercase' }}>{title}</h4>
        <div style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1 }}>{value}</div>
    </div>
);

const ChartPanel = ({ title, children }) => (
    <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} className="text-primary" /> {title}
        </h3>
        {children}
    </div>
);

const thStyle = { padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em' };
const tdStyle = { padding: '16px 20px', fontSize: '0.85rem' };

export default DashboardStats;
