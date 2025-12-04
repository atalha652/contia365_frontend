import React from "react";
import { Calendar } from "lucide-react";

const SemesterCard = ({ semester, onClick, isActive }) => {
    const getMonthRange = (semesterNumber) => {
        const ranges = {
            1: "Jan - Mar",
            2: "Apr - Jun",
            3: "Jul - Sep",
            4: "Oct - Dec",
        };
        return ranges[semesterNumber] || "";
    };

    return (
        <button
            onClick={() => onClick(semester)}
            className={`
        relative p-6 rounded-xl border-2 transition-all duration-300
        hover:shadow-lg hover:scale-105 transform
        ${isActive
                    ? "border-ac-02 bg-ac-02/10 shadow-md"
                    : "border-bd-50 bg-bg-60 hover:border-ac-02/50"
                }
      `}
        >
            <div className="flex flex-col items-center gap-3">
                <div
                    className={`
          p-3 rounded-full transition-colors
          ${isActive ? "bg-ac-02 text-white" : "bg-bg-50 text-fg-60"}
        `}
                >
                    <Calendar className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-fg-40">
                        Semester {semester}
                    </h3>
                    <p className="text-sm text-fg-60 mt-1">{getMonthRange(semester)}</p>
                </div>
            </div>
        </button>
    );
};

export default SemesterCard;
