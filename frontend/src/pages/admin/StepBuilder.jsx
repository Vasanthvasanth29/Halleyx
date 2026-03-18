import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ModernDropdown from '../../components/ModernDropdown';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    ChevronRight, 
    Settings, 
    Zap, 
    Shield, 
    Send,
    AlertCircle,
    CheckCircle2,
    Activity,
    MousePointer2,
    RotateCcw,
    ArrowUp,
    ArrowDown,
    ArrowRight
} from 'lucide-react';

const CONDITION_FIELDS = {
    'STUDENT_WORKFLOW': [
        { label: 'Request Type', value: 'requestType', type: 'string', options: ['LEAVE', 'OD'] },
        { label: 'Leave Days', value: 'leaveDays', type: 'number' }
    ],
    'EXPENSE_WORKFLOW': [
        { label: 'Amount', value: 'expenseAmount', type: 'number' },
        { label: 'Priority', value: 'priority', type: 'string', options: ['LOW', 'MEDIUM', 'HIGH'] },
        { label: 'Expense Type', value: 'expenseType', type: 'string', options: ['Travel', 'Food', 'Equipment', 'Other'] }
    ],
    'EMPLOYEE_WORKFLOW': [
        { label: 'Request Type', value: 'requestType', type: 'string', options: ['WFH', 'PR'] },
        { label: 'Reason', value: 'reason', type: 'string' }
    ],
    'DEFAULT': [
        { label: 'Request Type', value: 'requestType', type: 'string' },
        { label: 'Amount', value: 'amount', type: 'number' }
    ]
};

const OPERATORS = {
    number: ['==', '!=', '>', '<', '>=', '<='],
    string: ['==', '!=']
};

const StepBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [workflow, setWorkflow] = useState(null);
    const [steps, setSteps] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWorkflow();
    }, [id]);

    const fetchWorkflow = async () => {
        try {
            const res = await api.get(`/api/admin/workflows/${id}`);
            const data = res.data;
            setWorkflow(data.workflow);
            
            // Check if there's a locally saved draft
            const savedDraft = localStorage.getItem(`workflow_draft_${id}`);
            if (savedDraft && data.workflow?.status !== 'ACTIVE') {
                try {
                    const draftSteps = JSON.parse(savedDraft);
                    setSteps(draftSteps);
                    setLoading(false);
                    return;
                } catch (e) {
                    localStorage.removeItem(`workflow_draft_${id}`);
                }
            }

            if (data.steps && data.steps.length > 0) {
                // Map backend steps and rules to builder state
                const mappedSteps = data.steps.map(s => {
                    // Find rules for this step
                    const stepRules = data.rules.filter(r => r.step && r.step.id === s.id);
                    const nonDefaults = stepRules.filter(r => r.conditionValue?.trim().toUpperCase() !== 'DEFAULT');
                    const defaultRule = stepRules.find(r => r.conditionValue?.trim().toUpperCase() === 'DEFAULT');
                    
                    const mappedRules = nonDefaults.map((r, i) => ({
                        conditionAction: r.condition,
                        nextStepTempId: r.nextStep ? r.nextStep.id : '',
                        conditionValue: r.conditionValue || '',
                        priority: i + 1
                    }));

                    if (defaultRule) {
                        mappedRules.push({
                            conditionAction: defaultRule.condition,
                            nextStepTempId: defaultRule.nextStep ? defaultRule.nextStep.id : '',
                            conditionValue: 'DEFAULT',
                            priority: mappedRules.length + 1
                        });
                    }

                    return {
                        tempId: s.id, // Use persistent ID as tempId for existing steps
                        stepName: s.stepName,
                        stepType: s.stepType,
                        assignedRole: s.assignedRole,
                        allowedActions: s.allowedActions || '',
                        stepOrder: s.stepOrder,
                        rules: mappedRules
                    };
                });
                setSteps(mappedSteps);
            } else {
                setError('Critical Error: No logic steps found for this workflow definition.');
            }
        } catch (err) {
            setError('Failed to sync with workflow core.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevert = async () => {
        if (!window.confirm("Changing this workflow back to DRAFT will allow editing but will prevent new executions until re-published. Continue?")) return;
        
        setSaveLoading(true);
        try {
            await api.post(`/api/admin/workflows/${id}/revert-to-draft`);
            fetchWorkflow();
            alert("Workflow is now in DRAFT mode and unlocked for editing.");
        } catch (err) {
            setError("Failed to revert status: " + (err.response?.data?.message || err.message));
        } finally {
            setSaveLoading(false);
        }
    };

    const moveStep = (index, direction) => {
        const newSteps = [...steps];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= steps.length) return;
        
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        
        // Update selection to follow the moved step
        setSteps(newSteps);
        setSelectedIdx(newIndex);
    };

    const handleRemoveStep = (index) => {
        const stepToRemove = steps[index];

        // Safety Rule: Cannot edit when ACTIVE
        if (isActive) {
            alert("This workflow is ACTIVE. Please click 'Revert to Draft' in the top header to enable editing.");
            return;
        }
        
        // Safety Rules: Cannot delete first step
        if (index === 0) {
            alert("The 'Submission' step is mandatory and cannot be deleted.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${stepToRemove.stepName}"? All rules pointing to this step will be removed automatically.`)) return;

        const removedTempId = stepToRemove.tempId;
        const newSteps = steps.filter((_, i) => i !== index);
        const cleanedSteps = newSteps.map(s => ({
            ...s,
            rules: (s.rules || []).map(r => ({
                ...r,
                nextStepTempId: r.nextStepTempId === removedTempId ? '' : r.nextStepTempId
            }))
        }));

        setSteps(cleanedSteps);
        if (selectedIdx >= cleanedSteps.length) setSelectedIdx(Math.max(0, cleanedSteps.length - 1));
        else if (selectedIdx > index) setSelectedIdx(selectedIdx - 1);
    };


    const handleAddStep = () => {
        if (isActive) {
            alert("This workflow is ACTIVE. Please click 'Revert to Draft' in the top header to enable editing.");
            return;
        }
        const newStep = {
            tempId: `new_${Date.now()}`,
            stepName: 'New Step',
            stepType: 'TASK',
            assignedRole: 'USER',
            allowedActions: '',
            stepOrder: steps.length + 1,
            rules: []
        };
        setSteps([...steps, newStep]);
        setSelectedIdx(steps.length);
    };

    const updateStep = (field, value) => {
        const newSteps = [...steps];
        let newValue = value;

        // Auto-reorder and manage priorities for rules
        if (field === 'rules' && Array.isArray(value)) {
            // Case-insensitive check for DEFAULT
            const nonDefaults = value.filter(r => r.conditionValue?.trim().toUpperCase() !== 'DEFAULT');
            const defaultRule = value.find(r => r.conditionValue?.trim().toUpperCase() === 'DEFAULT');
            
            // Re-assign logical priorities 1...N
            newValue = nonDefaults.map((r, i) => ({
                ...r,
                priority: i + 1
            }));

            if (defaultRule) {
                // Force "DEFAULT" uppercase for consistency
                newValue.push({
                    ...defaultRule,
                    conditionValue: 'DEFAULT',
                    priority: newValue.length + 1
                });
            }
        }

        newSteps[selectedIdx][field] = newValue;
        setSteps(newSteps);
    };

    const parseCondition = (cond) => {
        if (!cond || cond === 'DEFAULT') return { field: '', op: '==', val: '' };
        // Matches "field op val" - handles spaces and quotes. Using * for value to allow partial typing.
        const match = cond.match(/^(\w+)\s*([<>=!]+)\s*(['"]?)([^'"]*)\3$/);
        if (match) {
            return { field: match[1], op: match[2], val: match[4] };
        }
        return { field: '', op: '==', val: cond }; // Fallback
    };

    const buildCondition = (field, op, val) => {
        if (!field) return '';
        const config = (CONDITION_FIELDS[workflow?.category] || CONDITION_FIELDS.DEFAULT).find(f => f.value === field);
        const formattedVal = config?.type === 'number' ? val : `'${val}'`;
        return `${field} ${op} ${formattedVal}`;
    };

    const validateWorkflow = () => {
        if (steps.length === 0) return "Workflow must have at least one step.";
        
        const hasEndStep = steps.some(s => s.stepType === 'END');
        if (!hasEndStep) return "Workflow must have exactly one END step.";
        
        const endStepCount = steps.filter(s => s.stepType === 'END').length;
        if (endStepCount > 1) return "Workflow cannot have more than one END step.";

        // Check each step's rules
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (step.stepType !== 'END') {
                if (!step.rules || step.rules.length === 0) {
                    return `Step "${step.stepName}" is missing transition rules.`;
                }

                // All rules must have a destination step
                for (const rule of step.rules) {
                    if (!rule.nextStepTempId) {
                        return `Rule in "${step.stepName}" is missing a destination step.`;
                    }
                }

                // Check for duplicate filled conditions within the same step
                const filledConditions = new Set();
                for (const rule of step.rules) {
                    const trimmedVal = rule.conditionValue?.trim() || '';
                    if (trimmedVal && trimmedVal.toUpperCase() !== 'DEFAULT') {
                        const uniqueKey = `${rule.conditionAction}_${trimmedVal.toUpperCase()}`;
                        if (filledConditions.has(uniqueKey)) {
                            return `Duplicate rule in "${step.stepName}": ${rule.conditionAction} for "${trimmedVal}".`;
                        }
                        filledConditions.add(uniqueKey);
                    }
                }
            }
        }

        return null;
    };

    // Sanitize rules before publishing: auto-convert last empty rule to DEFAULT
    const sanitizeStepsForPublish = () => {
        const endStep = steps.find(s => s.stepType === 'END');
        return steps.map(s => {
            if (s.stepType === 'END') return s;
            
            const rules = (s.rules || []).map((r, idx) => {
                const isLast = idx === s.rules.length - 1;
                const trimmedVal = r.conditionValue?.trim() || '';
                // Auto-promote last empty-condition rule → DEFAULT
                if (isLast && !trimmedVal) {
                    return { ...r, conditionValue: 'DEFAULT' };
                }
                return r;
            });

            // If no DEFAULT rule exists, auto-inject one → pointing to END step
            const hasDefault = rules.some(r => r.conditionValue?.trim().toUpperCase() === 'DEFAULT');
            if (!hasDefault && endStep) {
                rules.push({
                    conditionAction: 'APPROVE',
                    nextStepTempId: endStep.tempId,
                    conditionValue: 'DEFAULT',
                    priority: rules.length + 1
                });
            }

            return { ...s, rules };
        });
    };

    const handleSaveDraft = async () => {
        setSaveLoading(true);
        setError('');
        try {
            // Uses localStorage to persist draft state
            localStorage.setItem(`workflow_draft_${id}`, JSON.stringify(steps));
            alert('Draft saved locally. Your step changes are preserved.');
        } catch (err) {
            setError('Failed to save draft.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handlePublish = async () => {
        const validationError = validateWorkflow();
        if (validationError) {
            setError(`Workflow cannot be published: ${validationError}`);
            return;
        }

        setSaveLoading(true);
        setError('');
        try {
            // Sanitize rules: auto-promote empty last rule → DEFAULT, inject DEFAULT if missing
            const sanitizedSteps = sanitizeStepsForPublish();

            const payload = {
                steps: sanitizedSteps.map((s, idx) => ({
                    tempId: s.tempId || `step_${idx}`,
                    stepName: s.stepName,
                    stepType: s.stepType,
                    assignedRole: s.assignedRole,
                    allowedActions: s.allowedActions,
                    stepOrder: idx + 1,
                    rules: s.rules.map(r => ({
                        conditionAction: r.conditionAction,
                        nextStepTempId: r.nextStepTempId,
                        conditionValue: r.conditionValue || 'DEFAULT',
                        priority: r.priority || 0
                    }))
                }))
            };
            
            await api.post(`/api/admin/workflows/${id}/publish`, payload);
            // Clear saved draft
            localStorage.removeItem(`workflow_draft_${id}`);
            alert("Workflow published successfully and is now active.");
            navigate('/admin/workflows');
        } catch (err) {
            setError(err.response?.data?.message || 'Publish sequence failed.');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Syncing Workflow Parameters...</div>;

    const isActive = workflow?.status === 'ACTIVE';

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', background: '#0a0a0c' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/admin/workflows')} className="action-link" style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '800' }}>
                        <ArrowLeft size={16} /> WORKFLOWS
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '850', letterSpacing: '-0.03em' }}>{workflow?.name?.toUpperCase()}</h2>
                        <span className="premium-tag" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                            LOGIC DESIGNER
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!isActive && (
                        <button 
                            onClick={handleSaveDraft} 
                            disabled={saveLoading} 
                            className="glass-btn"
                            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        >
                            💾 Save Draft
                        </button>
                    )}
                    <button onClick={handlePublish} disabled={saveLoading} className="premium-btn" style={{ width: 'auto', padding: '10px 24px', borderRadius: '12px', fontSize: '0.9rem' }}>
                        {saveLoading ? 'Deploying...' : (isActive ? <><Send size={16} /> Publish as New Version</> : <><Send size={16} /> Activate Flow</>)}
                    </button>
                </div>
                {isActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="status-badge status-completed" style={{ gap: '8px' }}>
                            <CheckCircle2 size={16} /> LIVE ENGINE
                        </div>
                        <button onClick={handleRevert} disabled={saveLoading} className="glass-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            <RotateCcw size={16} /> Edit Logic
                        </button>
                    </div>
                )}
            </header>

            {error && (
                <div className="premium-alert alert-danger" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                {/* Left Panel: Logic Steps */}
                <div className="glass-card" style={{ width: '380px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '1.5px' }}>LOGIC STEPS</span>
                        <button 
                            onClick={handleAddStep} 
                            title='Add new step'
                            style={{ 
                                background: 'rgba(99, 102, 241, 0.15)', 
                                color: 'var(--primary)', 
                                border: '1px solid rgba(99, 102, 241, 0.3)', 
                                borderRadius: '8px', 
                                padding: '6px 10px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '800'
                            }}
                        >
                            <Plus size={14} /> ADD
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
                        {steps.map((step, idx) => (
                            <div 
                                key={step.tempId}
                                onClick={() => setSelectedIdx(idx)}
                                style={{ 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    marginBottom: '10px', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: selectedIdx === idx ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                    border: `1px solid ${selectedIdx === idx ? 'rgba(99, 102, 241, 0.3)' : 'transparent'}`,
                                    position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '10px', 
                                    background: selectedIdx === idx ? 'var(--primary)' : 'rgba(255,255,255,0.03)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '0.85rem', 
                                    fontWeight: '800',
                                    color: selectedIdx === idx ? 'white' : 'var(--text-muted)'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: selectedIdx === idx ? 'white' : '#cbd5e1' }}>{step.stepName}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary)', marginTop: '2px', letterSpacing: '1px', opacity: selectedIdx === idx ? 1 : 0.6 }}>{step.stepType}</div>
                                </div>

                                {/* Step Delete Button (Middle and END steps) */}
                                {idx !== 0 && (
                                    <button 
                                        className="step-delete-btn"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveStep(idx); }}
                                        title={`Delete ${step.stepName}`}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            padding: '8px', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'rgba(239, 68, 68, 0.6)',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                {selectedIdx === idx && <ChevronRight size={18} color="var(--primary)" />}
                                
                                {!isActive && selectedIdx === idx && (
                                    <div style={{ position: 'absolute', right: '-40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <button onClick={(e) => { e.stopPropagation(); moveStep(idx, 'up'); }} disabled={idx === 0} style={{ opacity: idx === 0 ? 0 : 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><ArrowUp size={12}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveStep(idx, 'down'); }} disabled={idx === steps.length - 1} style={{ opacity: idx === steps.length - 1 ? 0 : 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><ArrowDown size={12}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Configuration */}
                <div className="glass-effect" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {steps[selectedIdx] && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Settings size={22} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Step Configuration</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                                <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                    <label className="auth-label">Step Name</label>
                                    <input type="text" className="premium-input" value={steps[selectedIdx].stepName} onChange={e => updateStep('stepName', e.target.value)} />
                                </div>
                                <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                    <label className="auth-label">Step Type</label>
                                    <ModernDropdown 
                            value={steps[selectedIdx].stepType} 
                            onChange={e => updateStep('stepType', e.target.value)}
                            options={[
                                { label: 'TASK', value: 'TASK' },
                                { label: 'APPROVAL', value: 'APPROVAL' },
                                { label: 'NOTIFICATION', value: 'NOTIFICATION' },
                                { label: 'END', value: 'END' }
                            ]}
                        />
                                </div>
                                <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                    <label className="auth-label">Assigned Role</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <div style={{ position: 'absolute', left: '14px', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />
                                        <input type="text" className="premium-input" style={{ paddingLeft: '36px' }} value={steps[selectedIdx].assignedRole} onChange={e => updateStep('assignedRole', e.target.value.toUpperCase())} placeholder="e.g. STUDENT" />
                                    </div>
                                </div>
                                <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                    <label className="auth-label">Allowed Actions</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Zap size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                                        <input type="text" className="premium-input" style={{ paddingLeft: '36px' }} value={steps[selectedIdx].allowedActions} onChange={e => updateStep('allowedActions', e.target.value.toUpperCase())} placeholder="e.g. SUBMIT" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--secondary-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                                    <Zap size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Logical Rules</h3>
                            </div>

                            <div className="glass-effect" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--glass-border)' }}>
                                {steps[selectedIdx].rules?.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>No rules defined for this step. Add one to create a transition.</p>
                                        <button 
                                            onClick={() => updateStep('rules', [{ conditionAction: 'APPROVE', nextStepTempId: '', conditionValue: 'DEFAULT', priority: 1 }])}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                                        >
                                            <Plus size={16} /> + Add Rule
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {steps[selectedIdx].rules.map((rule, rIdx) => {
                                            const isDefault = rule.conditionValue?.trim().toUpperCase() === 'DEFAULT';
                                            const { field, op, val } = parseCondition(rule.conditionValue);
                                            const availableFields = CONDITION_FIELDS[workflow?.category] || CONDITION_FIELDS.DEFAULT;
                                            const fieldConfig = availableFields.find(f => f.value === field);

                                            return (
                                                <div key={rIdx} style={{ 
                                                    display: 'grid', gridTemplateColumns: '60px 120px 1fr auto', gap: '12px', 
                                                    marginBottom: '12px', alignItems: 'flex-start', 
                                                    background: isDefault ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.01)', 
                                                    padding: '16px', borderRadius: '16px', 
                                                    border: isDefault ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.03)' 
                                                }}>
                                                    <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                                        <label className="auth-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>Pri</label>
                                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: '800', fontSize: '0.8rem', color: 'var(--primary)' }}>
                                                            {rule.priority}
                                                        </div>
                                                        {isDefault && (
                                                            <div style={{ fontSize: '0.55rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'center', marginTop: '4px', letterSpacing: '0.5px' }}>DEFAULT</div>
                                                        )}
                                                    </div>

                                                    <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                                        <label className="auth-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>Action</label>
                                                        <ModernDropdown 
                                                            style={{ flex: 1 }}
                                                            value={rule.conditionAction} 
                                                            onChange={e => {
                                                                const newRules = [...steps[selectedIdx].rules];
                                                                newRules[rIdx].conditionAction = e.target.value;
                                                                updateStep('rules', newRules);
                                                            }}
                                                            options={[
                                                                { label: 'APPROVE', value: 'APPROVE' },
                                                                { label: 'REJECT', value: 'REJECT' },
                                                                { label: 'SUBMIT', value: 'SUBMIT' }
                                                            ]}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    {isDefault ? (
                                                                        <div className="premium-input" style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center' }}>
                                                                            DEFAULT (Fallback Rule)
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <ModernDropdown 
                                                                                style={{ flex: 1.5 }}
                                                                                value={field}
                                                                                onChange={e => {
                                                                                    const f = e.target.value;
                                                                                    const cfg = availableFields.find(af => af.value === f);
                                                                                    const newRules = [...steps[selectedIdx].rules];
                                                                                    newRules[rIdx].conditionValue = buildCondition(f, '==', cfg?.options ? cfg.options[0] : '');
                                                                                    updateStep('rules', newRules);
                                                                                }}
                                                                                options={availableFields.map(f => ({ label: f.label, value: f.value }))}
                                                                                placeholder="Select Field"
                                                                            />

                                                                            <ModernDropdown 
                                                                                style={{ flex: 0.8 }}
                                                                                value={op}
                                                                                onChange={e => {
                                                                                    const newRules = [...steps[selectedIdx].rules];
                                                                                    newRules[rIdx].conditionValue = buildCondition(field, e.target.value, val);
                                                                                    updateStep('rules', newRules);
                                                                                }}
                                                                                options={OPERATORS[fieldConfig?.type || 'string'].map(o => ({ label: o, value: o }))}
                                                                            />

                                                                            {fieldConfig?.options ? (
                                                                                <ModernDropdown 
                                                                                    style={{ flex: 1.5 }}
                                                                                    value={val}
                                                                                    onChange={e => {
                                                                                        const newRules = [...steps[selectedIdx].rules];
                                                                                        newRules[rIdx].conditionValue = buildCondition(field, op, e.target.value);
                                                                                        updateStep('rules', newRules);
                                                                                    }}
                                                                                    options={fieldConfig.options.map(o => ({ label: o, value: o }))}
                                                                                />
                                                                            ) : (
                                                                                <input 
                                                                                    type={fieldConfig?.type === 'number' ? 'number' : 'text'}
                                                                                    className="premium-input" 
                                                                                    style={{ flex: 1.5, padding: '6px', fontSize: '0.8rem' }}
                                                                                    placeholder="Value"
                                                                                    value={val}
                                                                                    onChange={e => {
                                                                                        const newRules = [...steps[selectedIdx].rules];
                                                                                        newRules[rIdx].conditionValue = buildCondition(field, op, e.target.value);
                                                                                        updateStep('rules', newRules);
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <ArrowRight size={14} color="var(--text-muted)" />
                                                                    <ModernDropdown 
                                                                        style={{ flex: 1 }}
                                                                        value={rule.nextStepTempId || ''} 
                                                                        onChange={e => {
                                                                            const newRules = [...steps[selectedIdx].rules];
                                                                            newRules[rIdx].nextStepTempId = e.target.value;
                                                                            updateStep('rules', newRules);
                                                                        }}
                                                                        options={steps.map((s, si) => ({ label: `${si + 1}. ${s.stepName}`, value: s.tempId }))}
                                                                        placeholder="Target Step"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <button onClick={() => updateStep('rules', steps[selectedIdx].rules.filter((_, i) => i !== rIdx))} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', alignSelf: 'center' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                <button 
                                                    onClick={() => updateStep('rules', [...(steps[selectedIdx].rules || []), { conditionAction: 'APPROVE', nextStepTempId: '', conditionValue: '', priority: (steps[selectedIdx].rules?.length || 0) + 1 }])}
                                                    style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '12px', borderRadius: '16px', width: '100%', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <Plus size={18} /> + Add Rule
                                                </button>
                                            </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        <style>{`
            .loading-container { display: flex; align-items: center; justify-content: center; height: 100vh; color: var(--text-muted); font-weight: 800; letter-spacing: 2px; font-size: 0.8rem; }
            .step-delete-btn:hover { color: #ef4444 !important; background: rgba(239, 68, 68, 0.1) !important; }
        `}</style>
        </div>
    );
};

export default StepBuilder;
