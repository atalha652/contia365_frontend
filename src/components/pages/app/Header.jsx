import React from "react";
import { PanelLeft, PanelLeftDashed, Sun, Moon } from "lucide-react";

const Header = ({ sidebarExpanded, toggleSidebar, theme, toggleTheme, title = "App" }) => {
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

      <div className="flex items-center gap-2">
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