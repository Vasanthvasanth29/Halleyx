import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Shield, ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-wrapper animate-fade-in" style={{ flexDirection: 'column', textAlign: 'center' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 className="hero-title text-gradient">HalleyX <span className="sub-gradient">Engine</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', fontWeight: '500' }}>
                    Orchestrate complex business logic with the world's most advanced glassmorphic automation framework.
                </p>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '32px', 
                justifyContent: 'center', 
                alignItems: 'stretch',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '1000px'
            }}>
                <div 
                    onClick={() => navigate('/login')}
                    className="glass-effect glass-card"
                    style={{ 
                        flex: '1',
                        minWidth: '300px',
                        padding: '60px 40px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px'
                    }}
                >
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '24px', 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        marginBottom: '8px'
                    }}>
                        <Key size={40} />
                    </div>
                    <div>
                        <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '850', marginBottom: '8px' }}>Login</h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>EXISTING OPERATORS</p>
                    </div>
                    <div style={{ marginTop: 'auto', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        INITIALIZE SESSION <ArrowRight size={18} />
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/register')}
                    className="glass-effect glass-card"
                    style={{ 
                        flex: '1',
                        minWidth: '300px',
                        padding: '60px 40px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px'
                    }}
                >
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '24px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--secondary)',
                        marginBottom: '8px'
                    }}>
                        <Shield size={40} />
                    </div>
                    <div>
                        <h2 className="text-secondary" style={{ fontSize: '2rem', fontWeight: '850', marginBottom: '8px' }}>Register</h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>NEW RECRUITS</p>
                    </div>
                    <div style={{ marginTop: 'auto', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        ENLIST NOW <ArrowRight size={18} />
                    </div>
                </div>
            </div>

            <p style={{ marginTop: '80px', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Powered by Advanced Automation Engine v2.4
            </p>
        </div>
    );
};

export default Home;
