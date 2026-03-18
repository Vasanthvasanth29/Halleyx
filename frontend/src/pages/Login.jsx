import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';

const Login = ({ onLogin, onSwitch }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email: username, password });
            
            if (res.status === 200) {
                const data = res.data;
                
                // Intelligent Redirection Logic
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('category', data.category);
                
                if (data.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (data.role === 'STUDENT') {
                    navigate('/student-dashboard');
                } else if (data.role === 'EMPLOYEE' || data.role === 'USER') {
                    navigate('/employee-dashboard');
                } else if (data.role === 'MANAGER' || data.role === 'REPORTING_MANAGER') {
                    navigate('/manager-dashboard');
                } else if (data.role === 'FINANCE') {
                    navigate('/finance-dashboard');
                } else if (data.role === 'CEO') {
                    navigate('/ceo-dashboard');
                } else if (data.role === 'HR') {
                    navigate('/hr-dashboard');
                } else if (data.role === 'ADVISOR') {
                    navigate('/advisor-dashboard');
                } else if (data.role === 'HOD') {
                    navigate('/hod-dashboard');
                } else if (data.role === 'PRINCIPAL') {
                    navigate('/principal-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Check your security credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper animate-fade-in">
            <div className="glass-effect auth-panel" style={{ maxWidth: '440px' }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', padding: '0' }}
                >
                    <ArrowLeft size={16} /> <span style={{ fontSize: '0.875rem' }}>Back to Home</span>
                </button>

                <h2 className="brand-title text-gradient" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '8px', fontWeight: '850' }}>Identify</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '600', letterSpacing: '1px', fontSize: '0.75rem' }}>HALLEYX COMMAND CENTER ACCESS</p>
                
                {error && (
                    <div className="premium-alert alert-danger">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label className="auth-label">Email or Username</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                            <input 
                                className="premium-input"
                                style={{ paddingLeft: '44px' }}
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                required 
                                placeholder="operator@halleyx.com"
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Engine Access Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                            <input 
                                type="password" 
                                className="premium-input"
                                style={{ paddingLeft: '44px' }}
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="premium-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
                        {loading ? 'AUTHENTICATING...' : <><LogIn size={20} /> AUTHORIZE ACCESS</>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        First time here? 
                        <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', marginLeft: '8px' }}>
                            Create account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
