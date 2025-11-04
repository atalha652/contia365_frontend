import React from "react";
import { NavLink, Outlet } from "react-router-dom";

// This component renders the vouchers page header, tabs, and nested routes content
const Vouchers = () => {
  // Simple English: This shows two tabs and renders the selected tab below.
  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tabs Bar shown above tab-specific headers with big top margin */}
        <div className="mt-10 mb-4">
          <div className="flex items-center gap-2">
            {/* Tab: Uploads */}
            <NavLink
              to="uploads"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm ${isActive ? "bg-bg-50 border border-bd-50 text-fg-40" : "text-fg-60 hover:text-fg-40"}`
              }
            >
              Uploads
            </NavLink>
            {/* Tab: Gmail */}
            <NavLink
              to="gmail"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm ${isActive ? "bg-bg-50 border border-bd-50 text-fg-40" : "text-fg-60 hover:text-fg-40"}`
              }
            >
              Gmail
            </NavLink>
          </div>
        </div>

        {/* Nested Route Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default Vouchers;