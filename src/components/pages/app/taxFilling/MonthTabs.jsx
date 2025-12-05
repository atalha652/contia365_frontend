import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

    // Update active month/quarter when semester changes
    useEffect(() => {
        if (isAnnualView) {
            const quarterParam = searchParams.get("quarter");
            const newQuarter = quarterParam ? parseInt(quarterParam) : 1;
            setActiveQuarter(newQuarter);
            setActiveMonth(null);
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

                {/* Quarter Data - Show all months for selected quarter */}
                <div className="flex-1 overflow-auto bg-bg-60 rounded-xl border border-bd-50 shadow-inner">
                    <div className="p-4">
                        {quarters.find(q => q.id === activeQuarter)?.months.map((month) => (
                            <div key={month} className="mb-6 last:mb-0">
                                <h3 className="text-lg font-semibold text-fg-40 mb-3 border-b border-bd-50 pb-2">
                                    {month}
                                </h3>
                                <MonthDataTable month={month} semester={activeQuarter} year={year} />
                            </div>
                        ))}
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
