import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitMerge, Users, FileSearch, LogOut, ChevronRight, Library } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');
        console.log("AdminLayout Check:", { role, hasToken: !!token });
        if (!token || role !== 'ADMIN') {
            navigate('/login');
        }
        setUserRole(role);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/workflow-library', label: 'Workflow Library', icon: <Library size={20} /> },
        { path: '/admin/user-mapping', label: 'User Mapping', icon: <Users size={20} /> },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: <FileSearch size={20} /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Premium Sidebar */}
            <aside className="glass-effect" style={{ width: '280px', borderRight: '1px solid var(--glass-border)', padding: '24px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
                <div style={{ marginBottom: '48px', padding: '0 12px' }}>
                    <h2 className="brand-title" style={{ fontSize: '1.75rem', margin: 0 }}>Admin<span className="text-gradient">Core</span></h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>VERSION 2.0.4</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))' : 'transparent',
                                border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                fontWeight: isActive ? '600' : '400'
                            })}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button 
                    onClick={handleLogout}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        color: '#fda4af',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, marginLeft: '280px', padding: '48px 60px' }}>
                <div className="animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
