import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const ModernDropdown = ({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select Option", 
    required = false,
    className = "",
    style = {},
    disabled = false,
    name = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        if (disabled) return;
        onChange({ target: { value: optionValue, name: name } });
        setIsOpen(false);
    };


    return (
        <div ref={dropdownRef} className={`modern-dropdown-wrapper ${className}`} style={{ position: 'relative', width: '100%', ...style }}>
            <div 
                className={`modern-dropdown-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#1e1e2f',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption ? (
                        <span style={{ color: '#fff', fontWeight: '600' }}>{selectedOption.label}</span>
                    ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{placeholder}</span>
                    )}
                </div>
                <ChevronDown 
                    size={18} 
                    style={{ 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                    }} 
                />
            </div>

            {isOpen && (
                <div 
                    className="modern-dropdown-list animate-slide-up"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        backgroundColor: '#1e1e2f',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        padding: '8px'
                    }}
                >
                    {options.length === 0 ? (
                        <div style={{ padding: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No options available</div>
                    ) : (
                        options.map((opt, idx) => (
                            <div 
                                key={idx}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleSelect(opt.value);
                                }}
                                className={`modern-dropdown-option ${value === opt.value ? 'selected' : ''}`}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    backgroundColor: value === opt.value ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                    color: value === opt.value ? '#60a5fa' : '#e2e8f0',
                                    marginBottom: idx === options.length - 1 ? 0 : '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== opt.value) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== opt.value) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ fontWeight: value === opt.value ? '600' : '400' }}>{opt.label}</span>
                                {value === opt.value && <Check size={16} color="#60a5fa" />}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ModernDropdown;
