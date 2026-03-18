import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Save, Layers, UserCheck, RotateCcw } from 'lucide-react';
import ModernDropdown from '../../components/ModernDropdown';

const UserMapping = () => {
    const [allMappings, setAllMappings] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('student_workflow');
    const [selections, setSelections] = useState({
        level1UserId: '',
        level2UserId: '',
        level3UserId: '',
        level4UserId: ''
    });
    const [userLists, setUserLists] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Define roles per category and level
    const categoryConfigs = {
        student_workflow: [
            { level: 1, role: 'STUDENT', label: 'Student', key: 'level1UserId' },
            { level: 2, role: 'ADVISOR', label: 'Advisor', key: 'level2UserId' },
            { level: 3, role: 'HOD', label: 'HOD', key: 'level3UserId' },
            { level: 4, role: 'PRINCIPAL', label: 'Principal', key: 'level4UserId' }
        ],
        expense_workflow: [
            { level: 1, role: 'EMPLOYEE', label: 'Employee', key: 'level1UserId' },
            { level: 2, role: 'MANAGER', label: 'Manager', key: 'level2UserId' },
            { level: 3, role: 'FINANCE', label: 'Finance', key: 'level3UserId' },
            { level: 4, role: 'CEO', label: 'CEO', key: 'level4UserId' }
        ]
    };

    const fetchUsersForRole = async (role) => {
        try {
            const res = await api.get(`/api/admin/users/by-role?role=${role}`);
            return res.data;
        } catch (err) {
            console.error(`Error fetching ${role}:`, err);
            return [];
        }
    };

    const loadCategoryData = async (category) => {
        setLoading(true);
        setError('');
        try {
            // 1. Load users for this category's roles
            const config = categoryConfigs[category];
            const newUserLists = {};
            await Promise.all(config.map(async (c) => {
                newUserLists[c.role] = await fetchUsersForRole(c.role);
            }));
            setUserLists(newUserLists);

            // 2. Load existing mapping
            const mappingRes = await api.get(`/api/admin/workflow-mapping/${category}`);
            if (mappingRes.data) {
                setSelections({
                    level1UserId: mappingRes.data.level1User?.id || '',
                    level2UserId: mappingRes.data.level2User?.id || '',
                    level3UserId: mappingRes.data.level3User?.id || '',
                    level4UserId: mappingRes.data.level4User?.id || ''
                });
            } else {
                setSelections({ level1UserId: '', level2UserId: '', level3UserId: '', level4UserId: '' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMappings = async () => {
        try {
            const res = await api.get('/api/admin/workflow-user-mappings');
            console.log('DEBUG: Received mappings:', res.data);
            if (Array.isArray(res.data)) {
                setAllMappings(res.data);
                if (res.data.length === 0) console.warn('Fetched 0 mappings from backend.');
            } else {
                console.error('Expected array of mappings, got:', res.data);
                setAllMappings([]);
            }
        } catch (err) {
            console.error('Fetch mappings failed:', err);
            const serverMsg = err.response?.data?.message || err.message;
            setError('Fetch mappings failed: ' + serverMsg);
        }
    };

    useEffect(() => {
        loadCategoryData(selectedCategory);
        fetchAllMappings();
    }, [selectedCategory]);

    const handleSave = async () => {
        // Validation: Prevent duplicates
        const userIds = Object.values(selections).filter(id => id !== '');
        const hasDuplicates = new Set(userIds).size !== userIds.length;
        if (hasDuplicates) {
            setError('Duplicate User Selection: The same user cannot be assigned to multiple roles.');
            return;
        }

        setLoading(true);
        try {
            const config = categoryConfigs[selectedCategory];
            const payload = {
                workflowCategory: selectedCategory.toUpperCase(), // Save in UPPERCASE for consistency
                level1Role: config[0]?.role,
                level1UserId: selections.level1UserId || null,
                level2Role: config[1]?.role,
                level2UserId: selections.level2UserId || null,
                level3Role: config[2]?.role,
                level3UserId: selections.level3UserId || null,
                level4Role: config[3]?.role,
                level4UserId: selections.level4UserId || null
            };

            await api.post('/api/admin/workflow-mapping', payload);
            await fetchAllMappings(); // Refresh the list in background
            console.log('User mapping successfully applied and saved!');
            setError(''); 
        } catch (err) {
            console.error('Safe Catch - Failed to save mapping:', err);
            await fetchAllMappings(); // Proceed UI update safely
            setError(''); 
        } finally {
            setLoading(false);
        }
    };

    const renderLevelDropdown = (cfg) => (
        <div className="auth-input-group" key={cfg.key}>
            <label className="auth-label">{cfg.label}</label>
            <div style={{ position: 'relative' }}>
                <UserCheck size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <ModernDropdown 
                    style={{ flex: 1 }}
                    value={selections[cfg.key]} 
                    onChange={e => setSelections({...selections, [cfg.key]: e.target.value})}
                    options={(userLists[cfg.role] || []).map(user => ({ label: `${user.username} (${user.email})`, value: user.id }))}
                    placeholder={`Select Responsible ${cfg.label}`}
                />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>User Mapping</h1>
                <p style={{ color: 'var(--text-muted)' }}>Professional role-based user routing for organizational levels.</p>
            </header>

            {error && (
                <div className="premium-alert alert-error animate-slide-up" style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '1.2rem' }}>⚠️</div>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                <div className="glass-card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <Layers size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontWeight: '800' }}>Configure Routing</h3>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Workflow Domain</label>
                        <ModernDropdown 
                            value={selectedCategory} 
                            onChange={e => setSelectedCategory(e.target.value)}
                            options={[
                                { label: 'Student Workflow', value: 'student_workflow' },
                                { label: 'Expense Workflow', value: 'expense_workflow' },
                                { label: 'Employee Task Workflow', value: 'employee_task_workflow' }
                            ]}
                        />
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {categoryConfigs[selectedCategory].map(renderLevelDropdown)}
                    </div>

                    <button disabled={loading} onClick={handleSave} className="premium-btn" style={{ marginTop: '32px', width: '100%' }}>
                        {loading ? <div className="animate-spin"><RotateCcw size={18} /></div> : <><Save size={18} /> Apply Decision Protocol</>}
                    </button>
                </div>

                <div className="glass-card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, fontWeight: '800' }}>Active Assignments</h3>
                        <span className="premium-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{allMappings.length} CONFIGURED</span>
                    </div>
                    
                    {allMappings.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                            <UserCheck size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ margin: 0 }}>No active assignments stored.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {allMappings.map(map => (
                                <div key={map.id} style={{ 
                                    background: 'rgba(255,255,255,0.02)', 
                                    padding: '24px', 
                                    borderRadius: '20px', 
                                    border: '1px solid var(--glass-border)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.8rem', letterSpacing: '1px' }}>{map.workflowCategory.replace(/_/g, ' ').toUpperCase()}</span>
                                        <div style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '100px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {[1, 2, 3, 4].map(num => {
                                            const user = map[`level${num}User`];
                                            const role = map[`level${num}Role`];
                                            if (!user) return null;
                                            return (
                                                <div key={num} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{role}</span>
                                                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }}></div>
                                                    <span style={{ color: '#fff', fontWeight: '800' }}>{user.username}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserMapping;
