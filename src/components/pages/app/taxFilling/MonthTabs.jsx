import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MonthDataTable from "./MonthDataTable";

const MonthTabs = ({ semester }) => {
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

    const months = getMonthsForSemester(semester);

    // Initialize active month from URL or default to first month
    const [activeMonth, setActiveMonth] = useState(() => {
        const monthParam = searchParams.get("month");
        const currentMonths = getMonthsForSemester(semester);
        return monthParam && currentMonths.includes(monthParam)
            ? monthParam
            : currentMonths[0];
    });

    // Update active month when semester changes
    useEffect(() => {
        const currentMonths = getMonthsForSemester(semester);
        const monthParam = searchParams.get("month");

        // If the current active month is not in the new semester's months, reset to first month
        if (!currentMonths.includes(activeMonth)) {
            const newMonth = currentMonths[0];
            setActiveMonth(newMonth);
            setSearchParams({ semester: semester.toString(), month: newMonth });
        } else if (monthParam && currentMonths.includes(monthParam)) {
            // If URL has a valid month for this semester, use it
            setActiveMonth(monthParam);
        }
    }, [semester]); // Only depend on semester change

    // Update URL when month changes
    const handleMonthChange = (month) => {
        setActiveMonth(month);
        setSearchParams({ semester: semester.toString(), month });
    };

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
                    <MonthDataTable month={activeMonth} semester={semester} />
                </div>
            </div>
        </div>
    );
};

export default MonthTabs;
