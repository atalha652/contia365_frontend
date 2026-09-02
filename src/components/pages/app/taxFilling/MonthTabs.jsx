import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Lock, Eye } from "lucide-react";
import MonthDataTable from "./MonthDataTable";

const EMPTY_DEADLINES = [];

const MonthTabs = ({ semester, year, disableUrlSync = false, defaultQuarterId, contentMode = "ledger", deadlineInfo = null, deadlines = EMPTY_DEADLINES }) => {
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
        // Use new deadlines array first
        if (Array.isArray(deadlines) && deadlines.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const future = deadlines
                .filter(d => d.deadline_date)
                .map(d => {
                    const [yyyy, mm, dd] = d.deadline_date.split("-").map(Number);
                    return new Date(yyyy, mm - 1, dd);
                })
                .filter(dt => dt >= today)
                .sort((a, b) => a - b);
            if (future.length > 0) return future[0];
        }
        // Fallback to legacy deadlineInfo text
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

    // Fiscal periods can only be opened once they have started. Months after the
    // current one stay locked; closed months are viewable but read-only.
    // The deadline calendar (contentMode "dates") must keep showing future dates.
    const enforcePeriodLock = contentMode === "ledger";

    const getMonthPeriodState = (monthName) => {
        const monthIndex = monthNames.indexOf(monthName);
        if (monthIndex < 0) return "current";
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        if (year > currentYear || (year === currentYear && monthIndex > currentMonth)) return "future";
        if (year < currentYear || monthIndex < currentMonth) return "past";
        return "current";
    };

    const isMonthLocked = (monthName) =>
        enforcePeriodLock && getMonthPeriodState(monthName) === "future";

    const isMonthReadOnly = (monthName) =>
        enforcePeriodLock && getMonthPeriodState(monthName) === "past";

    const pickSelectableMonth = (monthList) => {
        const now = new Date();
        if (now.getFullYear() === year) {
            const todayMonthName = monthNames[now.getMonth()];
            if (monthList.includes(todayMonthName)) return todayMonthName;
        }
        const openMonths = monthList.filter((m) => !isMonthLocked(m));
        if (openMonths.length === 0) return null;
        if (openMonths.length === monthList.length) return monthList[0];
        return openMonths[openMonths.length - 1];
    };

    const upcomingDeadlineMonth = (() => {
        if (contentMode !== "dates") return null;
        const upcomingStart = getUpcomingDeadlineStartDate();
        if (upcomingStart && upcomingStart.getFullYear() === year) {
            return monthNames[upcomingStart.getMonth()] || null;
        }
        return null;
    })();

    const pickMonthToOpen = (quarterMonths) => {
        if (!quarterMonths?.length) return null;
        if (upcomingDeadlineMonth && quarterMonths.includes(upcomingDeadlineMonth)) {
            return upcomingDeadlineMonth;
        }
        const todayMonth = getTodayMonthNameIfSameYear();
        if (todayMonth && quarterMonths.includes(todayMonth)) return todayMonth;
        return quarterMonths[0];
    };

    const renderLockedNotice = (monthName) => (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="w-11 h-11 rounded-full bg-bg-50 border border-bd-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-fg-60" />
            </div>
            <p className="text-sm font-semibold text-fg-40">
                {monthName ? `${monthName} is locked` : "This period is locked"}
            </p>
            <p className="text-xs text-fg-60 max-w-sm">
                Upcoming fiscal periods open once the month begins. Only the current month and
                closed months are available.
            </p>
        </div>
    );

    // Initialize active month/quarter from URL or default
    const [activeMonth, setActiveMonth] = useState(() => {
        if (isAnnualView) return null;
        const monthParam = disableUrlSync ? null : searchParams.get("month");
        const currentMonths = getMonthsForSemester(semester);
        if (monthParam && currentMonths.includes(monthParam) && !isMonthLocked(monthParam)) return monthParam;
        return pickSelectableMonth(currentMonths);
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
        if (isAnnualView) {
            const initialQuarterId = (typeof defaultQuarterId === "number" && defaultQuarterId >= 1 && defaultQuarterId <= 4)
                ? defaultQuarterId
                : 1;
            const initialQuarter = getAllQuarters().find(q => q.id === initialQuarterId) || getAllQuarters()[0];
            const monthToOpen = pickMonthToOpen(initialQuarter.months);
            return monthToOpen ? [monthToOpen] : [];
        }
        return [];
    });

    // Sync month/quarter when the selected period changes — not on every parent render.
    useEffect(() => {
        if (isAnnualView) {
            const quarterParam = disableUrlSync ? null : searchParams.get("quarter");
            const newQuarter = quarterParam
                ? parseInt(quarterParam)
                : (() => {
                    if (upcomingDeadlineMonth) {
                        return Math.floor(monthNames.indexOf(upcomingDeadlineMonth) / 3) + 1;
                    }
                    return (typeof defaultQuarterId === "number" && defaultQuarterId >= 1 && defaultQuarterId <= 4 ? defaultQuarterId : 1);
                })();
            setActiveQuarter(newQuarter);
            setActiveMonth(null);
            const selectedQuarter = getAllQuarters().find(q => q.id === newQuarter);
            if (selectedQuarter) {
                const monthToOpen = pickMonthToOpen(selectedQuarter.months);
                setExpandedMonths(monthToOpen ? [monthToOpen] : []);
            }
        } else {
            const currentMonths = getMonthsForSemester(semester);
            const monthParam = disableUrlSync ? null : searchParams.get("month");

            if (!currentMonths.includes(activeMonth) || isMonthLocked(activeMonth)) {
                const newMonth = pickSelectableMonth(currentMonths);
                setActiveMonth(newMonth);
                if (!disableUrlSync && newMonth) {
                    const next = new URLSearchParams(searchParams);
                    next.set("semester", semester.toString());
                    next.set("month", newMonth);
                    setSearchParams(next);
                }
            } else if (monthParam && currentMonths.includes(monthParam) && !isMonthLocked(monthParam)) {
                setActiveMonth(monthParam);
            }
            setActiveQuarter(null);
        }
        // upcomingDeadlineMonth is a primitive so accordion state is not reset when
        // a parent re-renders with a new deadlines=[] identity.
    }, [semester, disableUrlSync, defaultQuarterId, contentMode, upcomingDeadlineMonth, year]);

    // Update URL when month changes
    const handleMonthChange = (month) => {
        if (isMonthLocked(month)) return;
        setActiveMonth(month);
        if (!disableUrlSync) {
            const next = new URLSearchParams(searchParams);
            next.set("semester", semester.toString());
            next.set("month", month);
            setSearchParams(next);
        }
    };

    // Update URL when quarter changes
    const handleQuarterChange = (quarterId) => {
        setActiveQuarter(quarterId);
        const selectedQuarter = getAllQuarters().find(q => q.id === quarterId);
        if (selectedQuarter) {
            const monthToOpen = pickMonthToOpen(selectedQuarter.months);
            setExpandedMonths(monthToOpen ? [monthToOpen] : []);
        }
        if (!disableUrlSync) {
            const next = new URLSearchParams(searchParams);
            next.set("semester", "annual");
            next.set("quarter", quarterId.toString());
            next.delete("month");
            setSearchParams(next);
        }
    };

    // Toggle accordion item
    const toggleMonth = (month) => {
        if (isMonthLocked(month)) return;
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

        // Group fiscal obligations by deadline date. Status comes from the backend.
        const deadlineDayMap = {};
        if (Array.isArray(deadlines) && deadlines.length > 0) {
            deadlines.forEach((d) => {
                if (!d.deadline_date) return;
                const [yyyy, mm, dd] = d.deadline_date.split("-").map(Number);
                if (yyyy === year && mm - 1 === monthIndex) {
                    if (!deadlineDayMap[dd]) deadlineDayMap[dd] = [];
                    deadlineDayMap[dd].push(d);
                }
            });
        }
        const hasDeadlines = Object.keys(deadlineDayMap).length > 0;
        const statusPriority = { overdue: 4, due: 3, upcoming: 2, completed: 1 };
        const statusClasses = {
            upcoming: "bg-blue-500/15 text-blue-600 border-blue-400/40",
            due: "bg-orange-500/15 text-orange-600 border-orange-400/40",
            overdue: "bg-red-500/15 text-red-600 border-red-400/40",
            completed: "bg-green-500/15 text-green-600 border-green-400/40",
        };
        const statusDotClasses = {
            upcoming: "bg-blue-500",
            due: "bg-orange-500",
            overdue: "bg-red-500",
            completed: "bg-green-500",
        };
        const getPrimaryStatus = (obligations = []) =>
            obligations.reduce((primary, obligation) => {
                const status = String(obligation?.status || "upcoming").toLowerCase();
                return (statusPriority[status] || 0) > (statusPriority[primary] || 0)
                    ? status
                    : primary;
            }, "completed");

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
                    {Array.from({ length: startWeekday }).map((_, i) => <div key={`pad-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const isToday = todayDate === dayNum;
                        const obligations = deadlineDayMap[dayNum];
                        const isDeadlineDay = Boolean(obligations?.length);
                        const primaryStatus = isDeadlineDay ? getPrimaryStatus(obligations) : null;
                        return (
                            <div
                                key={dayNum}
                                title={isDeadlineDay
                                    ? obligations.map((obligation) => `Modelo ${obligation.modelo}: ${obligation.status}`).join("\n")
                                    : undefined}
                                className={`
                                    relative h-9 rounded-lg flex flex-col items-center justify-center
                                    text-sm font-medium border transition-colors
                                    ${isDeadlineDay
                                        ? statusClasses[primaryStatus]
                                        : isToday
                                            ? "bg-gradient-to-r from-ac-02 to-blue-600 text-white border-transparent shadow-md"
                                            : "bg-bg-60 text-fg-40 border-bd-50"
                                    }
                                    ${isToday && isDeadlineDay ? "ring-2 ring-ac-02 ring-offset-1 ring-offset-bg-60" : ""}
                                `}
                            >
                                <span>{dayNum}</span>
                                {isDeadlineDay && (
                                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${statusDotClasses[primaryStatus]}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
                {/* Legend */}
                {hasDeadlines && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(deadlineDayMap).map(([day, obligations]) => {
                            const primaryStatus = getPrimaryStatus(obligations);
                            return (
                            <span key={day} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${statusClasses[primaryStatus]}`}>
                                <span className="font-semibold">{obligations.map((obligation) => obligation.modelo).join(", ")}</span>
                                <span className="opacity-70">· {day} {monthName}</span>
                            </span>
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
                                        ? "bg-[#582dee] text-white shadow-md shadow-[#582dee]/30 scale-105"
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
                            const locked = isMonthLocked(month);
                            const readOnly = isMonthReadOnly(month);
                            const isExpanded = !locked && expandedMonths.includes(month);

                            return (
                                <div
                                    key={month}
                                    className="bg-bg-70 rounded-lg border border-bd-50 overflow-hidden transition-all duration-300 hover:shadow-md"
                                >
                                    {/* Accordion Header */}
                                    <button
                                        onClick={() => toggleMonth(month)}
                                        disabled={locked}
                                        title={locked ? `${month} opens when the month starts` : undefined}
                                        className={`w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-bg-60 to-bg-70 transition-all duration-200 ${locked ? "cursor-not-allowed opacity-60" : "hover:from-bg-50 hover:to-bg-60"}`}
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
                                                {locked ? <Lock className="w-4 h-4" /> : index + 1}
                                            </div>
                                            <h3 className={`
                                                text-lg font-semibold transition-colors
                                                ${isExpanded ? 'text-fg-40' : 'text-fg-60'}
                                            `}>
                                                {month}
                                            </h3>
                                            {locked && (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-50 border border-bd-50 text-fg-60">
                                                    Locked
                                                </span>
                                            )}
                                            {readOnly && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-50 border border-bd-50 text-fg-60">
                                                    <Eye className="w-3 h-3" />
                                                    Read-only
                                                </span>
                                            )}
                                        </div>
                                        <div className={`
                                            transition-transform duration-300
                                            ${isExpanded ? 'rotate-180' : 'rotate-0'}
                                        `}>
                                            {!locked && (
                                                <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-ac-02' : 'text-fg-60'}`} />
                                            )}
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
                    {months.map((month) => {
                        const locked = isMonthLocked(month);
                        return (
                            <button
                                key={month}
                                onClick={() => handleMonthChange(month)}
                                disabled={locked}
                                title={locked ? `${month} opens when the month starts` : undefined}
                                className={`
                relative px-6 py-2.5 text-sm font-medium rounded-lg
                inline-flex items-center gap-2
                transition-all duration-300 ease-out
                ${locked
                                        ? "text-fg-60/50 cursor-not-allowed"
                                        : activeMonth === month
                                            ? "bg-[#582dee] text-white shadow-md shadow-[#582dee]/30 scale-105"
                                            : "text-fg-60 hover:text-fg-40 hover:bg-bg-40"
                                    }
              `}
                            >
                                {locked && <Lock className="w-3.5 h-3.5" />}
                                {month}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Month Data Table - Scrollable with enhanced container */}
            <div className="flex-1 overflow-auto bg-bg-60 rounded-xl border border-bd-50 shadow-inner">
                <div className="p-4">
                    {activeMonth ? (
                        <>
                            {isMonthReadOnly(activeMonth) && (
                                <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-50 border border-bd-50 text-xs text-fg-60">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{activeMonth} is closed — read-only.</span>
                                </div>
                            )}
                            <MonthDataTable month={activeMonth} semester={semester} year={year} />
                        </>
                    ) : (
                        renderLockedNotice(null)
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthTabs;
