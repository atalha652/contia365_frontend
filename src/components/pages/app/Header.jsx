import React, { useState, useEffect } from "react";
import { PanelLeft, PanelLeftDashed, Sun, Moon } from "lucide-react";

const Header = ({ sidebarExpanded, toggleSidebar, theme, toggleTheme, title = "App" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
  const quarterLabels = {
    1: "Jan – Mar",
    2: "Apr – Jun",
    3: "Jul – Sep",
    4: "Oct – Dec",
  };
  const currentQuarterLabel = `Q${quarter} ${currentDate.getFullYear()} · ${quarterLabels[quarter]}`;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-fg-60 hover:text-fg-50 transition-colors hover:bg-bg-50 rounded-full"
        >
          {sidebarExpanded ? (
            <PanelLeftDashed size={20} strokeWidth={1.5} />
          ) : (
            <PanelLeft size={20} strokeWidth={1.5} />
          )}
        </button>
        <h1 className="text-base font-semibold text-fg-50">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-fg-50 border border-bd-50 rounded-lg px-3 py-1.5 bg-bg-50">
          {currentQuarterLabel}
        </span>
        <span className="text-sm text-white border border-[#582dee] rounded-lg px-3 py-1.5 bg-[#582dee] font-medium shadow-sm">
          {formattedDate}
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-fg-60 hover:text-fg-50 transition-colors hover:bg-bg-50"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon size={18} strokeWidth={1.5} />
          ) : (
            <Sun size={18} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;