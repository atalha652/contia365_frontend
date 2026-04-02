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

    // Parse the deadlines array from the new API response format
    const getDeadlineDates = () => {
        const deadlines = deadlineInfo?.deadlines;
        if (!Array.isArray(deadlines) || deadlines.length === 0) return [];
        return deadlines
            .filter(d => d?.deadline_date)
            .map(d => ({
                ...d,
                date: new Date(d.deadline_date + "T00:00:00"),
            }))
            .filter(d => !isNaN(d.date.getTime()));
    };

    const getUpcomingDeadlineStartDate = () => {
        const dates = getDeadlineDates();
        if (dates.length === 0) return null;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const upcoming = dates.find(d => d.date >= todayStart);
        return upcoming ? upcoming.date : null;
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
            January: 0, February: 1, March: 2, April: 3,
            May: 4, June: 5, July: 6, August: 7,
            September: 8, October: 9, November: 10, December: 11,
        };
        const monthIndex = monthIndexByName[monthName];
        if (monthIndex === undefined) return null;

        const allDeadlines = getDeadlineDates();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Deadlines that fall in this specific month
        const monthDeadlines = allDeadlines.filter(
            d => d.date.getFullYear() === year && d.date.getMonth() === monthIndex
        );
        // Set of day numbers that are deadline dates in this month
        const deadlineDaySet = new Set(monthDeadlines.map(d => d.date.getDate()));

        const firstDay = new Date(year, monthIndex, 1);
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const startWeekday = firstDay.getDay();

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
        const todayDate = isCurrentMonth ? today.getDate() : null;

        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-7 gap-2">
                    {labels.map((d) => (
                        <div key={d} className="text-[11px] font-semibold text-fg-60 text-center">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startWeekday }).map((_, i) => (
                        <div key={`pad-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const isToday = todayDate === dayNum;
                        const isDeadlineDate = deadlineDaySet.has(dayNum);
                        const isPast = new Date(year, monthIndex, dayNum) < todayStart;
                        return (
                            <div
                                key={dayNum}
                                title={
                                    isDeadlineDate
                                        ? monthDeadlines
                                            .filter(d => d.date.getDate() === dayNum)
                                            .map(d => `Modelo ${d.modelo}: ${d.description}`)
                                            .join("\n")
                                        : undefined
                                }
                                className={`
                                    h-9 rounded-lg flex items-center justify-center text-sm font-medium
                                    border transition-colors cursor-default
                                    ${isToday
                                        ? "bg-gradient-to-r from-ac-02 to-blue-600 text-white border-transparent shadow-md"
                                        : isDeadlineDate && !isPast
                                            ? "bg-orange-500/15 text-orange-600 border-orange-400/40 ring-1 ring-orange-400/60"
                                            : isDeadlineDate && isPast
                                                ? "bg-fg-60/10 text-fg-60 border-bd-50 line-through"
                                                : "bg-bg-60 text-fg-40 border-bd-50"
                                    }
                                `}
                            >
                                {dayNum}
                            </div>
                        );
                    })}
                </div>

                {/* Deadline list for this month */}
                {monthDeadlines.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                        {monthDeadlines.map((d, i) => {
                            const isPast = d.date < todayStart;
                            return (
                                <div key={i} className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${isPast ? "bg-fg-60/5 border-bd-50 text-fg-60" : "bg-orange-500/10 border-orange-400/30 text-fg-40"}`}>
                                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${isPast ? "bg-fg-60" : "bg-orange-500"}`} />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-semibold">Modelo {d.modelo}</span>
                                        <span className="mx-1 text-fg-60">•</span>
                                        <span className="text-fg-60">{d.description}</span>
                                    </div>
                                    <span className={`shrink-0 font-medium ${isPast ? "text-fg-60" : "text-orange-600"}`}>
                                        {d.days_remaining > 0 ? `${d.days_remaining}d left` : isPast ? "Passed" : "Today"}
                                    </span>
                                </div>
                            );
                        })}
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
