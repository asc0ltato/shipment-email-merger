'use client';

import { useState, useEffect, useRef } from 'react';
import { CustomCalendar } from './CustomCalendar';

interface DateRangeSelectProps {
    value: { startDate: string; endDate: string };
    onChange: (value: { startDate: string; endDate: string }) => void;
}

export function DateRangeSelect({ value, onChange }: DateRangeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempDates, setTempDates] = useState({
        startDate: '',
        endDate: ''
    });
    const [currentCalendar, setCurrentCalendar] = useState<'start' | 'end'>('start');
    const [showCalendar, setShowCalendar] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const formatToDisplay = (dateString: string): string => {
        if (!dateString) return '';

        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }

        if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
            return dateString;
        }

        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }

        return dateString;
    };

    const formatToSave = (dateString: string): string => {
        if (!dateString || dateString === 'dd-mm-yyyy') return '';

        if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
            return dateString;
        }

        const parts = dateString.split('/');
        if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
            return `${parts[1]}-${parts[0]}-${parts[2]}`;
        }

        return dateString;
    };

    const compareDates = (date1: string, date2: string): number => {
        if (!date1 || !date2 || date1 === 'dd-mm-yyyy' || date2 === 'dd-mm-yyyy') return 0;

        try {
            const [day1, month1, year1] = date1.split('-').map(Number);
            const [day2, month2, year2] = date2.split('-').map(Number);

            const d1 = new Date(year1, month1 - 1, day1);
            const d2 = new Date(year2, month2 - 1, day2);

            return d1.getTime() - d2.getTime();
        } catch {
            return 0;
        }
    };

    const predefinedRanges = [
        {
            label: 'Today',
            getDates: () => {
                const today = new Date();
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const day = today.getDate().toString().padStart(2, '0');
                const year = today.getFullYear();
                return {
                    startDate: `${day}-${month}-${year}`,
                    endDate: `${day}-${month}-${year}`
                };
            }
        },
        {
            label: 'Last 7 days',
            getDates: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 6);

                const startDay = start.getDate().toString().padStart(2, '0');
                const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
                const startYear = start.getFullYear();

                const endDay = end.getDate().toString().padStart(2, '0');
                const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
                const endYear = end.getFullYear();

                return {
                    startDate: `${startDay}-${startMonth}-${startYear}`,
                    endDate: `${endDay}-${endMonth}-${endYear}`
                };
            }
        },
        {
            label: 'Last 30 days',
            getDates: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 29);

                const startDay = start.getDate().toString().padStart(2, '0');
                const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
                const startYear = start.getFullYear();

                const endDay = end.getDate().toString().padStart(2, '0');
                const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
                const endYear = end.getFullYear();

                return {
                    startDate: `${startDay}-${startMonth}-${startYear}`,
                    endDate: `${endDay}-${endMonth}-${endYear}`
                };
            }
        },
        {
            label: 'Last month',
            getDates: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0);

                const startDay = start.getDate().toString().padStart(2, '0');
                const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
                const startYear = start.getFullYear();

                const endDay = end.getDate().toString().padStart(2, '0');
                const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
                const endYear = end.getFullYear();

                return {
                    startDate: `${startDay}-${startMonth}-${startYear}`,
                    endDate: `${endDay}-${endMonth}-${endYear}`
                };
            }
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCalendar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTempDates({
                startDate: value.startDate,
                endDate: value.endDate
            });
        }
    }, [isOpen, value.startDate, value.endDate]);

    const handleMainMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMainMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            if (isOpen) {
                setIsOpen(false);
                setShowCalendar(false);
            }
        }, 150);
    };

    const handleDropdownMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleDropdownMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            if (isOpen) {
                setIsOpen(false);
                setShowCalendar(false);
            }
        }, 100);
    };

    const handleApply = () => {
        const formattedDates = {
            startDate: tempDates.startDate,
            endDate: tempDates.endDate
        };
        onChange(formattedDates);
        setIsOpen(false);
        setShowCalendar(false);
    };

    const handlePredefinedRange = (getDates: () => { startDate: string; endDate: string }) => {
        const dates = getDates();
        onChange(dates);
        setIsOpen(false);
        setShowCalendar(false);
    };

    const handleDateSelect = (date: string) => {
        if (currentCalendar === 'start') {
            if (tempDates.endDate && compareDates(date, formatToDisplay(tempDates.endDate)) > 0) {
                setTempDates({
                    startDate: tempDates.endDate,
                    endDate: formatToSave(date)
                });
            } else {
                setTempDates(prev => ({
                    ...prev,
                    startDate: formatToSave(date)
                }));
            }
        } else {
            if (tempDates.startDate && compareDates(date, formatToDisplay(tempDates.startDate)) < 0) {
                setTempDates({
                    startDate: formatToSave(date),
                    endDate: tempDates.startDate
                });
            } else {
                setTempDates(prev => ({
                    ...prev,
                    endDate: formatToSave(date)
                }));
            }
        }
    };

    const handleCalendarClose = () => {
        setShowCalendar(false);
    };

    const handleInputFocus = (field: 'start' | 'end') => {
        setCurrentCalendar(field);
        setShowCalendar(true);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const displayText = value.startDate && value.endDate
        ? `${formatToDisplay(value.startDate)} - ${formatToDisplay(value.endDate)}`
        : 'Last day';

    return (
        <div
            className="relative"
            ref={selectRef}
            onMouseEnter={handleMainMouseEnter}
            onMouseLeave={handleMainMouseLeave}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm text-slate-700 hover:border-slate-400 hover:bg-white/90 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="font-medium">{displayText}</span>
                <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
               <div
                    className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-[380px] bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl p-4 space-y-4"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                >
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick select</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {predefinedRanges.map((range, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handlePredefinedRange(range.getDates)}
                                    className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white/50 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-slate-700 font-medium hover:shadow-sm transform hover:-translate-y-0.5"
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-600">From</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatToDisplay(tempDates.startDate)}
                                        onFocus={() => handleInputFocus('start')}
                                        readOnly
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 cursor-pointer"
                                        placeholder="dd-mm-yyyy"
                                    />
                                    {showCalendar && currentCalendar === 'start' && (
                                        <div className="absolute z-10 top-full left-0 mt-1">
                                            <CustomCalendar
                                                selectedStartDate={formatToDisplay(tempDates.startDate)}
                                                selectedEndDate={formatToDisplay(tempDates.endDate)}
                                                onDateSelect={handleDateSelect}
                                                onClose={handleCalendarClose}
                                                currentField="start"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-600">To</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatToDisplay(tempDates.endDate)}
                                        onFocus={() => handleInputFocus('end')}
                                        readOnly
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 cursor-pointer"
                                        placeholder="dd-mm-yyyy"
                                    />
                                    {showCalendar && currentCalendar === 'end' && (
                                        <div className="absolute z-10 top-full left-0 mt-1">
                                            <CustomCalendar
                                                selectedStartDate={formatToDisplay(tempDates.startDate)}
                                                selectedEndDate={formatToDisplay(tempDates.endDate)}
                                                onDateSelect={handleDateSelect}
                                                onClose={handleCalendarClose}
                                                currentField="end"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/60">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="px-4 py-2.5 text-sm bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}