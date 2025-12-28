'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomCalendarProps {
    selectedStartDate: string;
    selectedEndDate: string;
    onDateSelect: (date: string) => void;
    onClose: () => void;
    currentField?: 'start' | 'end';
}

export function CustomCalendar({ selectedStartDate, selectedEndDate, onDateSelect, onClose }: CustomCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');
    const yearsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (view === 'years' && yearsContainerRef.current) {
            const currentYear = new Date().getFullYear();
            const yearElements = yearsContainerRef.current.querySelectorAll('button');
            const currentYearElement = Array.from(yearElements).find(button =>
                parseInt(button.textContent || '0') === currentYear
            );

            if (currentYearElement) {
                currentYearElement.scrollIntoView({ behavior: 'auto', block: 'center' });
            } else {
                yearsContainerRef.current.scrollTop = yearsContainerRef.current.scrollHeight;
            }
        }
    }, [view]);

    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const parseDate = (dateString: string): Date | null => {
        if (!dateString || dateString === 'dd-mm-yyyy') return null;
        const [day, month, year] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const isDateInRange = (date: Date): boolean => {
        const start = parseDate(selectedStartDate);
        const end = parseDate(selectedEndDate);

        if (!start || !end) return false;
        return date >= start && date <= end;
    };

    const isStartDate = (date: Date): boolean => {
        return formatDate(date) === selectedStartDate;
    };

    const isEndDate = (date: Date): boolean => {
        return formatDate(date) === selectedEndDate;
    };

    const isDateDisabled = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    const handleDateClick = (date: Date) => {
        if (isDateDisabled(date)) return;

        const dateString = formatDate(date);
        onDateSelect(dateString);

        onClose();
    };

    const handleMonthClick = (month: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(month);
        setCurrentDate(newDate);
        setView('days');
    };

    const handleYearClick = (year: number) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setCurrentDate(newDate);
        setView('months');
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek < 0) firstDayOfWeek = 6;

        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                const nextMonth = new Date(prev);
                nextMonth.setMonth(prev.getMonth() + 1);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (nextMonth > today) {
                    return prev;
                }
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const navigateYear = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setFullYear(prev.getFullYear() - 1);
            } else {
                newDate.setFullYear(prev.getFullYear() + 1);
            }
            return newDate;
        });
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    const days = getDaysInMonth(currentDate);

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    const renderHeader = () => {
        switch (view) {
            case 'days':
                return (
                    <button
                        onClick={() => setView('months')}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </button>
                );
            case 'months':
                return (
                    <button
                        onClick={() => setView('years')}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {currentDate.getFullYear()}
                    </button>
                );
            case 'years':
                return (
                    <button
                        onClick={() => setView('days')}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </button>
                );
        }
    };

    const renderNavigationButtons = () => {
        switch (view) {
            case 'days':
                const today = new Date();
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(currentDate.getMonth() + 1);
                const isNextDisabled = nextMonth > today;

                return [
                    <button
                        key="prev"
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>,
                    <button
                        key="next"
                        onClick={() => !isNextDisabled && navigateMonth('next')}
                        disabled={isNextDisabled}
                        className={`p-2 rounded-lg transition-colors ${
                            isNextDisabled
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'hover:bg-slate-100'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ];
            case 'months':
            case 'years':
                return [
                    <button
                        key="prev"
                        onClick={() => navigateYear('prev')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>,
                    <button
                        key="next"
                        onClick={() => navigateYear('next')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ];
            default:
                return [<div key="prev" />, <div key="next" />];
        }
    };

    const getDateStyle = (date: Date | null, isDisabled: boolean): string => {
        if (!date) {
            return '';
        }

        if (isDisabled) {
            return 'text-slate-300 cursor-not-allowed hover:bg-transparent';
        }

        if (isStartDate(date) || isEndDate(date)) {
            return 'bg-slate-600 text-white font-semibold';
        }

        if (isDateInRange(date)) {
            return 'bg-slate-200 text-slate-800 font-medium';
        }

        return 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-80">
            <div className="flex items-center justify-between mb-4">
                {renderNavigationButtons()[0]}
                {renderHeader()}
                {renderNavigationButtons()[1]}
            </div>

            {view === 'days' && (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, index) => {
                            const isDisabled = date ? isDateDisabled(date) : false;
                            return (
                                <button
                                    key={index}
                                    onClick={() => date && !isDisabled && handleDateClick(date)}
                                    disabled={!date || isDisabled}
                                    className={`
                                        w-8 h-8 text-sm rounded transition-all duration-200
                                        ${!date ? 'invisible' : ''}
                                        ${getDateStyle(date, isDisabled)}
                                        ${date && date.getMonth() !== currentDate.getMonth() && !isDisabled ? 'text-slate-400' : ''}
                                    `}
                                >
                                    {date ? date.getDate() : ''}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {view === 'months' && (
                <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                        <button
                            key={month}
                            onClick={() => handleMonthClick(index)}
                            className={`
                                py-3 text-sm rounded-lg transition-all duration-200
                                ${currentDate.getMonth() === index
                                ? 'bg-slate-200 text-slate-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }
                            `}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            )}

            {view === 'years' && (
                <div
                    ref={yearsContainerRef}
                    className="grid grid-cols-4 gap-2 h-60 overflow-y-auto"
                >
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => handleYearClick(year)}
                            className={`
                                py-3 text-sm rounded-lg transition-all duration-200
                                ${currentDate.getFullYear() === year
                                ? 'bg-slate-200 text-slate-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }
                            `}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}

            {view === 'days' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-3 py-2 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}