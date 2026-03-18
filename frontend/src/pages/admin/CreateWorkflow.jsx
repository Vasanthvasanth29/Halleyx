import React, { useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, GitMerge, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import ModernDropdown from '../../components/ModernDropdown';

const CreateWorkflow = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('STUDENT_WORKFLOW');
    const [inputFields, setInputFields] = useState([]);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !category) {
            setError('Workflow Name and Category are required.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = {
                name,
                description,
                category,
                status: 'DRAFT', // Explicitly start as DRAFT
                version: 1,
                inputFields: inputFields
            };
            const res = await api.post('/api/admin/workflows', payload);
            navigate(`/admin/workflow-builder/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create workflow.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 'calc(100vh - 120px)',
            width: '100%' 
        }}>
            <div className="glass-card" style={{ 
                padding: '48px', 
                width: '100%', 
                maxWidth: '600px',
                textAlign: 'center' 
            }}>
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'var(--primary)', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 24px auto',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                }}>
                    <Plus size={32} color="white" />
                </div>

                <header style={{ marginBottom: '40px' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>Create Workflow</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Initialize a new automated process with the advanced logic engine.</p>
                </header>
                
                {error && <div className="premium-alert alert-danger" style={{ marginBottom: '32px', textAlign: 'left' }}><Info size={18} /> {error}</div>}
                
                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="auth-input-group" style={{ marginBottom: '24px' }}>
                        <label className="auth-label">Workflow Name</label>
                        <input 
                            type="text" 
                            className="premium-input" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                            placeholder="e.g. OD Permission Workflow" 
                        />
                    </div>
                    
                    <div className="auth-input-group" style={{ marginBottom: '24px' }}>
                        <label className="auth-label">Category</label>
                        <ModernDropdown 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                            options={[
                                { label: 'Student Workflow', value: 'STUDENT_WORKFLOW' },
                                { label: 'Employee Workflow', value: 'EMPLOYEE_WORKFLOW' },
                                { label: 'Expense Workflow', value: 'EXPENSE_WORKFLOW' }
                            ]}
                        />
                    </div>

                    <div className="auth-input-group" style={{ marginBottom: '40px' }}>
                        <label className="auth-label">Description</label>
                        <textarea 
                            className="premium-input" 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Detail the lifecycle and rules for this workflow..."
                        />
                    </div>

                    {category !== 'STUDENT_WORKFLOW' && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <label className="auth-label" style={{ marginBottom: 0 }}>Input Fields (Form Builder)</label>
                                <button 
                                    type="button" 
                                    onClick={() => setInputFields([...inputFields, { fieldName: '', fieldType: 'TEXT', required: true, allowedValues: '' }])}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' }}
                                >
                                    <Plus size={14} style={{ marginRight: '4px' }} /> Add Field
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {inputFields.map((field, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <input 
                                            type="text" 
                                            className="premium-input" 
                                            style={{ marginBottom: 0, padding: '8px 12px', fontSize: '0.85rem' }}
                                            placeholder="Field Name" 
                                            value={field.fieldName}
                                            onChange={e => {
                                                const newFields = [...inputFields];
                                                newFields[idx].fieldName = e.target.value;
                                                setInputFields(newFields);
                                            }}
                                        />
                                        <ModernDropdown 
                            style={{ flex: 1.5, marginBottom: 0 }}
                                            value={field.fieldType}
                                            onChange={e => {
                                                const newFields = [...inputFields];
                                                newFields[idx].fieldType = e.target.value;
                                                setInputFields(newFields);
                                            }}
                            options={[
                                { label: 'STRING', value: 'TEXT' },
                                { label: 'NUMBER', value: 'NUMBER' },
                                { label: 'DATE', value: 'DATE' },
                                { label: 'DROPDOWN', value: 'DROPDOWN' }
                            ]}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={field.required}
                                                onChange={e => {
                                                    const newFields = [...inputFields];
                                                    newFields[idx].required = e.target.checked;
                                                    setInputFields(newFields);
                                                }}
                                            />
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>REQ</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setInputFields(inputFields.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {field.fieldType === 'DROPDOWN' && (
                                            <div style={{ gridColumn: 'span 4', marginTop: '8px' }}>
                                                <input 
                                                    type="text" 
                                                    className="premium-input" 
                                                    style={{ marginBottom: 0, padding: '8px 12px', fontSize: '0.8rem' }}
                                                    placeholder="Comma-separated values (e.g. Leave, OD, Sick)" 
                                                    value={field.allowedValues}
                                                    onChange={e => {
                                                        const newFields = [...inputFields];
                                                        newFields[idx].allowedValues = e.target.value;
                                                        setInputFields(newFields);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="premium-btn" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                        {loading ? 'Initializing Engine...' : <><Plus size={20} /> Deploy Configuration</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkflow;