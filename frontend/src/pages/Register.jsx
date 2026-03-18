import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, Lock, UserCircle, AlertCircle, CheckCircle, Briefcase, Layout } from 'lucide-react';
import ModernDropdown from '../components/ModernDropdown';

const Register = ({ onSwitch }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        accountType: 'USER', // ADMIN or USER
        category: 'student_workflow',
        role: 'STUDENT'
    });
    
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roleMappings = {
        student_workflow: ['STUDENT', 'ADVISOR', 'HOD', 'PRINCIPAL'],
        expense_workflow: ['EMPLOYEE', 'MANAGER', 'FINANCE', 'CEO'],
        employee_task_workflow: ['EMPLOYEE', 'MANAGER', 'HR']
    };

    useEffect(() => {
        if (formData.accountType === 'USER') {
            setFormData(prev => ({ ...prev, role: roleMappings[prev.category][0] }));
        }
    }, [formData.category, formData.accountType]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');
        setLoading(true);

        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.accountType === 'ADMIN' ? 'ADMIN' : formData.role,
            category: formData.accountType === 'ADMIN' ? 'GENERAL' : formData.category
        };

        try {
            const response = await api.post('/auth/register', payload);

            if (response.status === 200 || response.status === 201) {
                setStatus('Registration successful. Please login.');
                setTimeout(onSwitch, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server connection failed. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper animate-fade-in">
            <div className="glass-effect auth-panel" style={{ maxWidth: '540px' }}>
                <h2 className="brand-title text-gradient" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '8px', fontWeight: '850' }}>Enlistment</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '600', letterSpacing: '1px', fontSize: '0.75rem' }}>JOIN THE HALLEYX AUTOMATION CORPS</p>

                {error && <div className="premium-alert alert-danger"><AlertCircle size={18} /> {error}</div>}
                {status && <div className="premium-alert alert-success"><CheckCircle size={18} /> {status}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label className="auth-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <UserCircle size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                            <input 
                                name="username"
                                className="premium-input" 
                                style={{ paddingLeft: '44px' }} 
                                value={formData.username} 
                                onChange={handleChange} 
                                required 
                                placeholder="Choose a username" 
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                            <input 
                                name="email"
                                type="email" 
                                className="premium-input" 
                                style={{ paddingLeft: '44px' }} 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                placeholder="name@email.com" 
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                            <input 
                                name="password"
                                type="password" 
                                className="premium-input" 
                                style={{ paddingLeft: '44px' }} 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Account Type</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)', zIndex: 10 }} />
                            <ModernDropdown 
                                style={{ flex: 1, paddingLeft: '44px' }}
                                value={formData.accountType} 
                                onChange={handleChange}
                                name="accountType"
                                options={[
                                    { label: 'User Operator', value: 'USER' },
                                    { label: 'System Administrator', value: 'ADMIN' }
                                ]}
                            />
                        </div>
                    </div>

                    {formData.accountType === 'USER' && (
                        <>
                            <div className="auth-input-group">
                                <label className="auth-label">Workflow Category</label>
                                <div style={{ position: 'relative' }}>
                                    <Layout size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)', zIndex: 10 }} />
                                    <ModernDropdown 
                                        style={{ flex: 1, paddingLeft: '44px' }}
                                        value={formData.category} 
                                        onChange={handleChange}
                                        name="category"
                                        options={[
                                            { label: 'Student Workflow', value: 'student_workflow' },
                                            { label: 'Expense Workflow', value: 'expense_workflow' },
                                            { label: 'Employee Task Workflow', value: 'employee_task_workflow' }
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Designated Role</label>
                                <ModernDropdown 
                                    style={{ flex: 1 }}
                                    value={formData.role} 
                                    onChange={handleChange}
                                    name="role"
                                    options={roleMappings[formData.category].map(r => ({ label: r.replace('_', ' '), value: r }))}
                                />
                            </div>
                        </>
                    )}

                    <button disabled={loading} type="submit" className="premium-btn" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {loading ? 'PROCESSING...' : <><UserPlus size={20} /> CREATE OPERATOR PROFILE</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already an operator? 
                    <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', marginLeft: '8px' }}>
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;