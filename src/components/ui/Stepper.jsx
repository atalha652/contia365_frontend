// frontend/src/components/ui/Stepper.jsx
import React from "react";

const Stepper = ({ steps, currentStep }) => {
    return (
        <ol className="flex items-center w-full mb-6">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                    <li key={step.key} className="flex-1 flex items-center">
                        <div className="flex items-center">
                            <div
                                className={`flex items-center justify-center h-8 w-8 rounded-full border ${isCompleted
                                        ? "bg-ac-02 text-white border-ac-02"
                                        : isActive
                                            ? "border-ac-02 text-ac-02"
                                            : "border-bd-50 text-fg-60"
                                    }`}
                                aria-current={isActive ? "step" : undefined}
                            >
                                <span className="text-xs font-medium">
                                    {isCompleted ? "✓" : index + 1}
                                </span>
                            </div>
                            <span className={`ml-2 text-sm ${isActive ? "text-fg-50" : "text-fg-60"}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-[1px] mx-3 bg-bd-50" />
                        )}
                    </li>
                );
            })}
        </ol>
    );
};

export default Stepper;


