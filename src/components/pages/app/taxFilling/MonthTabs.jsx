import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import MonthDataTable from "./MonthDataTable";

const MonthTabs = ({ semester, year, disableUrlSync = false, defaultQuarterId, contentMode = "ledger", deadlineInfo = null }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const getTodayMonthNameIfSameYear = () => {
        const now = new Date();
        if (now.getFullYear() !== year) return null;
        return monthNames[now.getMonth()] || null;
    };

    const parseDeadlineRange = (deadlineText) => {
        if (!deadlineText || typeof deadlineText !== "string") return null;
        const re = /(\d{1,2})\s+([A-Za-z]{3})\s*[–-]\s*(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/;
        const m = deadlineText.match(re);
        if (!m) return null;

        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        const startDay = Number(m[1]);
        const startMonth = monthMap[m[2]];
        const endDay = Number(m[3]);
        const endMonth = monthMap[m[4]];
        const endYear = Number(m[5]);
        const startYear = endYear;
        if (startMonth === undefined || endMonth === undefined) return null;

        const start = new Date(startYear, startMonth, startDay);
        const end = new Date(endYear, endMonth, endDay);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
        return { start, end };
    };

    const getUpcomingDeadlineStartDate = () => {
        const range = parseDeadlineRange(deadlineInfo?.deadline);
        if (!range) return null;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (range.end < todayStart) return null;
        return range.start > todayStart ? range.start : todayStart;
    };

    const getMonthsForSemester = (semesterNumber) => {
        const monthGroups = {
            1: ["January", "February", "March"],
            2: ["April", "May", "June"],
            3: ["July", "August", "September"],
            4: ["October", "November", "December"],
        };
        return monthGroups[semesterNumber] || [];
    };

    const getAllQuarters = () => {
        return [
            { id: 1, label: "Q1", months: ["January", "February", "March"] },
            { id: 2, label: "Q2", months: ["April", "May", "June"] },
            { id: 3, label: "Q3", months: ["July", "August", "September"] },
            { id: 4, label: "Q4", months: ["October", "November", "December"] },
        ];
    };

    const isAnnualView = semester === 'annual';
    const months = isAnnualView ? [] : getMonthsForSemester(semester);
    const quarters = isAnnualView ? getAllQuarters() : [];

    // Initialize active month/quarter from URL or default
    const [activeMonth, setActiveMonth] = useState(() => {
        if (isAnnualView) return null;
        const monthParam = disableUrlSync ? null : searchParams.get("month");
        const currentMonths = getMonthsForSemester(semester);
        if (monthParam && currentMonths.includes(monthParam)) return monthParam;
        // Default to current month if it falls in this quarter and year matches
        const now = new Date();
        if (now.getFullYear() === year) {
            const todayMonthName = monthNames[now.getMonth()];
            if (currentMonths.includes(todayMonthName)) return todayMonthName;
        }
        return currentMonths[0];
    });

    const [activeQuarter, setActiveQuarter] = useState(() => {
        if (!isAnnualView) return null;
        const quarterParam = disableUrlSync ? null : searchParams.get("quarter");
        if (quarterParam) return parseInt(quarterParam);
        if (contentMode === "dates") {
            const upcomingStart = getUpcomingDeadlineStartDate();
            if (upcomingStart && upcomingStart.getFullYear() === year) {
                return Math.floor(upcomingStart.getMonth() / 3) + 1;
            }
        }
        if (typeof defaultQuarterId === "number" && defaultQuarterId >= 1 && defaultQuarterId <= 4) return defaultQuarterId;
        return 1;
    });

    // Track which accordion items are open (for Annual view)
    const [expandedMonths, setExpandedMonths] = useState(() => {
        // By default, expand the first month of the first quarter
        if (isAnnualView) {
            const initialQuarterId = (typeof defaultQuarterId === "number" && defaultQuarterId >= 1 && defaultQuarterId <= 4)
                ? defaultQuarterId
                : 1;
            const initialQuarter = getAllQuarters().find(q => q.id === initialQuarterId) || getAllQuarters()[0];
            if (contentMode === "dates") {
                const upcomingStart = getUpcomingDeadlineStartDate();
                if (upcomingStart && upcomingStart.getFullYear() === year) {
                    return [monthNames[upcomingStart.getMonth()]];
                }
            }
            const todayMonth = getTodayMonthNameIfSameYear();
            const monthToOpen = (todayMonth && initialQuarter.months.includes(todayMonth)) ? todayMonth : initialQuarter.months[0];
            return [monthToOpen];
        }
        return [];
    });

    // Update active month/quarter when semester changes
    useEffect(() => {
        if (isAnnualView) {
            const quarterParam = disableUrlSync ? null : searchParams.get("quarter");
            const newQuarter = quarterParam
                ? parseInt(quarterParam)
                : (() => {
                    if (contentMode === "dates") {
                        const upcomingStart = getUpcomingDeadlineStartDate();
                        if (upcomingStart && upcomingStart.getFullYear() === year) {
                            return Math.floor(upcomingStart.getMonth() / 3) + 1;
                        }
                    }
                    return (typeof defaultQuarterId === "number" && defaultQuarterId >= 1 && defaultQuarterId <= 4 ? defaultQuarterId : 1);
                })();
            setActiveQuarter(newQuarter);
            setActiveMonth(null);
            // Expand deadline month (if available); otherwise current month; otherwise first month
            const selectedQuarter = getAllQuarters().find(q => q.id === newQuarter);
            if (selectedQuarter) {
                if (contentMode === "dates") {
                    const upcomingStart = getUpcomingDeadlineStartDate();
                    const deadlineMonthName = upcomingStart && upcomingStart.getFullYear() === year
                        ? monthNames[upcomingStart.getMonth()]
                        : null;
                    if (deadlineMonthName && selectedQuarter.months.includes(deadlineMonthName)) {
                        setExpandedMonths([deadlineMonthName]);
                        return;
                    }
                }
                const todayMonth = getTodayMonthNameIfSameYear();
                const monthToOpen = (todayMonth && selectedQuarter.months.includes(todayMonth)) ? todayMonth : selectedQuarter.months[0];
                setExpandedMonths([monthToOpen]);
            }
        } else {
            const currentMonths = getMonthsForSemester(semester);
            const monthParam = disableUrlSync ? null : searchParams.get("month");

            if (!currentMonths.includes(activeMonth)) {
                const now = new Date();
                const todayMonthName = now.getFullYear() === year ? monthNames[now.getMonth()] : null;
                const newMonth = (todayMonthName && currentMonths.includes(todayMonthName))
                    ? todayMonthName
                    : currentMonths[0];
                setActiveMonth(newMonth);
                if (!disableUrlSync) setSearchParams({ semester: semester.toString(), month: newMonth });
            } else if (monthParam && currentMonths.includes(monthParam)) {
                setActiveMonth(monthParam);
            }
            setActiveQuarter(null);
        }
    }, [semester, disableUrlSync, defaultQuarterId, contentMode, deadlineInfo, year]);

    // Update URL when month changes
    const handleMonthChange = (month) => {
        setActiveMonth(month);
        if (!disableUrlSync) setSearchParams({ semester: semester.toString(), month });
    };

    // Update URL when quarter changes
    const handleQuarterChange = (quarterId) => {
        setActiveQuarter(quarterId);
        if (!disableUrlSync) setSearchParams({ semester: 'annual', quarter: quarterId.toString() });
    };

    // Toggle accordion item
    const toggleMonth = (month) => {
        setExpandedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        );
    };

    const renderMonthDateGrid = (monthName) => {
        const monthIndexByName = {
            January: 0,
            February: 1,
            March: 2,
            April: 3,
            May: 4,
            June: 5,
            July: 6,
            August: 7,
            September: 8,
            October: 9,
            November: 10,
            December: 11,
        };
        const monthIndex = monthIndexByName[monthName];
        if (monthIndex === undefined) return null;

        const deadlineRange = parseDeadlineRange(deadlineInfo?.deadline);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const upcomingDeadlineRange = deadlineRange
            ? {
                start: deadlineRange.start > todayStart ? deadlineRange.start : todayStart,
                end: deadlineRange.end,
            }
            : null;
        const hasUpcomingDeadline = Boolean(
            upcomingDeadlineRange && upcomingDeadlineRange.end >= upcomingDeadlineRange.start
        );
        const firstDay = new Date(year, monthIndex, 1);
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const startWeekday = firstDay.getDay(); // 0=Sun

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
        const todayDate = isCurrentMonth ? today.getDate() : null;

        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-7 gap-2">
                    {labels.map((d) => (
                        <div key={d} className="text-[11px] font-semibold text-fg-60 text-center">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startWeekday }).map((_, i) => (
                        <div key={`pad-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const isToday = todayDate === dayNum;
                        const currentDate = new Date(year, monthIndex, dayNum);
                        const isDeadlineDate = hasUpcomingDeadline
                            ? currentDate >= upcomingDeadlineRange.start && currentDate <= upcomingDeadlineRange.end
                            : false;
                        return (
                            <div
                                key={dayNum}
                                className={`
                                    h-9 rounded-lg flex items-center justify-center text-sm font-medium
                                    border transition-colors
                                    ${isToday
                                        ? "bg-gradient-to-r from-ac-02 to-blue-600 text-white border-transparent shadow-md"
                                        : isDeadlineDate
                                            ? "bg-orange-500/15 text-orange-600 border-orange-400/40"
                                            : "bg-bg-60 text-fg-40 border-bd-50"
                                    }
                                `}
                            >
                                {dayNum}
                            </div>
                        );
                    })}
                </div>
                {hasUpcomingDeadline && deadlineInfo?.deadline && (
                    <div className="text-xs text-fg-60 pt-1">
                        Upcoming deadline: <span className="font-medium text-fg-40">{deadlineInfo.deadline}</span>
                        {deadlineInfo?.modelo_no ? <span> • Modelo {deadlineInfo.modelo_no}</span> : null}
                        {deadlineInfo?.name ? <span> • {deadlineInfo.name}</span> : null}
                    </div>
                )}
            </div>
        );
    };

    if (isAnnualView) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                {/* Quarter Tabs for Annual View */}
                <div className="flex-shrink-0 mb-6">
                    <div className="inline-flex gap-2 p-1.5 bg-bg-50 rounded-xl border border-bd-50 shadow-inner">
                        {quarters.map((quarter) => (
                            <button
                                key={quarter.id}
                                onClick={() => handleQuarterChange(quarter.id)}
                                className={`
                                    relative px-6 py-2.5 text-sm font-medium rounded-lg
                                    transition-all duration-300 ease-out
                                    ${activeQuarter === quarter.id
                                        ? "bg-gradient-to-r from-ac-02 to-blue-600 text-white shadow-lg shadow-ac-02/30 scale-105"
                                        : "text-fg-60 hover:text-fg-40 hover:bg-bg-40"
                                    }
                                `}
                            >
                                {quarter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accordion for months in selected quarter */}
                <div className="flex-1 overflow-auto bg-bg-60 rounded-xl border border-bd-50 shadow-inner">
                    <div className="p-4 space-y-3">
                        {quarters.find(q => q.id === activeQuarter)?.months.map((month, index) => {
                            const isExpanded = expandedMonths.includes(month);

                            return (
                                <div
                                    key={month}
                                    className="bg-bg-70 rounded-lg border border-bd-50 overflow-hidden transition-all duration-300 hover:shadow-md"
                                >
                                    {/* Accordion Header */}
                                    <button
                                        onClick={() => toggleMonth(month)}
                                        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-bg-60 to-bg-70 hover:from-bg-50 hover:to-bg-60 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                                                transition-all duration-300
                                                ${isExpanded
                                                    ? 'bg-gradient-to-br from-ac-02 to-blue-600 text-white shadow-md'
                                                    : 'bg-bg-50 text-fg-60'
                                                }
                                            `}>
                                                {index + 1}
                                            </div>
                                            <h3 className={`
                                                text-lg font-semibold transition-colors
                                                ${isExpanded ? 'text-fg-40' : 'text-fg-60'}
                                            `}>
                                                {month}
                                            </h3>
                                        </div>
                                        <div className={`
                                            transition-transform duration-300
                                            ${isExpanded ? 'rotate-180' : 'rotate-0'}
                                        `}>
                                            <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-ac-02' : 'text-fg-60'}`} />
                                        </div>
                                    </button>

                                    {/* Accordion Content */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                                    `}>
                                        <div className="p-5 border-t border-bd-50 bg-bg-70">
                                            {contentMode === "dates"
                                                ? renderMonthDateGrid(month)
                                                : <MonthDataTable month={month} semester={activeQuarter} year={year} />
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Enhanced Month Tabs with pill design */}
            <div className="flex-shrink-0 mb-6">
                <div className="inline-flex gap-2 p-1.5 bg-bg-50 rounded-xl border border-bd-50 shadow-inner">
                    {months.map((month) => (
                        <button
                            key={month}
                            onClick={() => handleMonthChange(month)}
                            className={`
                relative px-6 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-300 ease-out
                ${activeMonth === month
                                    ? "bg-gradient-to-r from-ac-02 to-blue-600 text-white shadow-lg shadow-ac-02/30 scale-105"
                                    : "text-fg-60 hover:text-fg-40 hover:bg-bg-40"
                                }
              `}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </div>

            {/* Month Data Table - Scrollable with enhanced container */}
            <div className="flex-1 overflow-auto bg-bg-60 rounded-xl border border-bd-50 shadow-inner">
                <div className="p-4">
                    <MonthDataTable month={activeMonth} semester={semester} year={year} />
                </div>
            </div>
        </div>
    );
};

export default MonthTabs;
