'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomSelectProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    placeholder?: string;
    forceOpen?: boolean;
}

export function CustomSelect<T extends string>({
                                                   value,
                                                   onChange,
                                                   options,
                                                   placeholder,
                                                   forceOpen = false
                                               }: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true);
        }
    }, [forceOpen]);

    const handleMainMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMainMouseLeave = (event: React.MouseEvent) => {
        const relatedTarget = event.relatedTarget;

        if (selectRef.current && relatedTarget &&
            relatedTarget instanceof Node &&
            document.body.contains(relatedTarget) &&
            selectRef.current.contains(relatedTarget)) {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    const handleDropdownMouseLeave = (event: React.MouseEvent) => {
        const relatedTarget = event.relatedTarget;

        if (selectRef.current && relatedTarget &&
            relatedTarget instanceof Node &&
            document.body.contains(relatedTarget) &&
            selectRef.current.contains(relatedTarget)) {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 100);
    };

    const handleOptionClick = (optionValue: T) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className="relative"
            ref={selectRef}
            onMouseEnter={handleMainMouseEnter}
            onMouseLeave={handleMainMouseLeave}
        >
            <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm text-sm text-slate-700 shadow-sm flex items-center justify-between font-medium cursor-pointer hover:border-slate-400 hover:bg-white/90 transition-all duration-200">
                <span>{selectedOption?.label || placeholder}</span>
                <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>

            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl overflow-hidden"
                    onMouseLeave={handleDropdownMouseLeave}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleOptionClick(option.value)}
                            className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 font-medium ${
                                value === option.value
                                    ? 'bg-slate-100 text-slate-800 border-r-2 border-slate-600'
                                    : 'text-slate-700 hover:bg-slate-50/80'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}