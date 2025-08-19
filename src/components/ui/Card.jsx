// frontend/src/components/ui/Card.jsx
import React from "react";

const Card = ({ title, subtitle, children, footer, className = "", bodyClassName = "" }) => {
    return (
        <div className={`mt-8 bg-bg-60 rounded-2xl shadow-lg p-8 border border-bd-50 ${className}`}>
            {(title || subtitle) && (
                <div className="text-center mb-6">
                    {title && (
                        <h2 className="mt-2 text-3xl font-extrabold text-fg-50">{title}</h2>
                    )}
                    {subtitle && <p className="mt-2 text-sm text-fg-60">{subtitle}</p>}
                </div>
            )}
            <div className={bodyClassName}>
                {children}
            </div>
            {footer && <div className="mt-6">{footer}</div>}
        </div>
    );
};

export default Card;


