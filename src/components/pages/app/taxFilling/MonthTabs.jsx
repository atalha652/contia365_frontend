import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import MonthDataTable from "./MonthDataTable";

const MonthTabs = ({ semester, year }) => {
    const [searchParams, setSearchParams] = useSearchParams();

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
        const monthParam = searchParams.get("month");
        const currentMonths = getMonthsForSemester(semester);
        return monthParam && currentMonths.includes(monthParam)
            ? monthParam
            : currentMonths[0];
    });

    const [activeQuarter, setActiveQuarter] = useState(() => {
        if (!isAnnualView) return null;
        const quarterParam = searchParams.get("quarter");
        return quarterParam ? parseInt(quarterParam) : 1;
    });

    // Track which accordion items are open (for Annual view)
    const [expandedMonths, setExpandedMonths] = useState(() => {
        // By default, expand the first month of the first quarter
        if (isAnnualView) {
            const firstQuarter = getAllQuarters()[0];
            return [firstQuarter.months[0]];
        }
        return [];
    });

    // Update active month/quarter when semester changes
    useEffect(() => {
        if (isAnnualView) {
            const quarterParam = searchParams.get("quarter");
            const newQuarter = quarterParam ? parseInt(quarterParam) : 1;
            setActiveQuarter(newQuarter);
            setActiveMonth(null);
            // Expand first month of the selected quarter
            const selectedQuarter = getAllQuarters().find(q => q.id === newQuarter);
            if (selectedQuarter) {
                setExpandedMonths([selectedQuarter.months[0]]);
            }
        } else {
            const currentMonths = getMonthsForSemester(semester);
            const monthParam = searchParams.get("month");

            if (!currentMonths.includes(activeMonth)) {
                const newMonth = currentMonths[0];
                setActiveMonth(newMonth);
                setSearchParams({ semester: semester.toString(), month: newMonth });
            } else if (monthParam && currentMonths.includes(monthParam)) {
                setActiveMonth(monthParam);
            }
            setActiveQuarter(null);
        }
    }, [semester]);

    // Update URL when month changes
    const handleMonthChange = (month) => {
        setActiveMonth(month);
        setSearchParams({ semester: semester.toString(), month });
    };

    // Update URL when quarter changes
    const handleQuarterChange = (quarterId) => {
        setActiveQuarter(quarterId);
        setSearchParams({ semester: 'annual', quarter: quarterId.toString() });
    };

    // Toggle accordion item
    const toggleMonth = (month) => {
        setExpandedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
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
                                            <MonthDataTable month={month} semester={activeQuarter} year={year} />
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
