import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  LogOut,
  KeyRound,
  FilePlus,
  ShieldCheck,
  Building2,
  Inbox,
  UserCog,
  Users,
} from "lucide-react";
import Logo from "./Logo";
import { canViewSalesWaitlist } from "../../../api/apiFunction/waitlistServices";
import { canViewAdminUsers } from "../../../api/apiFunction/adminUserServices";

const AppSidebar = ({ sidebarExpanded, setSidebarExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/sign-in");
  };

  const isAdmin = canViewAdminUsers(user);
  const userType = String(user?.user_type || user?.user_type_selection || user?.type || "").toLowerCase();
  const isPerson = ["person", "individual", "autonomo", "freelancer"].includes(userType);
  const showCompany = !isPerson;

  const items = isAdmin
    ? [
        { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
        { to: "/app/users", label: "Users", icon: UserCog },
        { to: "/app/waitlist", label: "Sales waitlist", icon: Inbox },
      ]
    : [
        { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
        { to: "/app/expenses", label: "Expenses", icon: FileText },
        { to: "/app/invoices", label: "Invoices", icon: FilePlus },
        { to: "/app/ledger", label: "Ledger", icon: BookOpen },
        { to: "/app/tax-filings", label: "Compliance & Tax Filing", icon: Users },
        ...(showCompany ? [{ to: "/app/settings/company", label: "Company Profile", icon: Building2 }] : []),
        { to: "/app/settings/aeat", label: "AEAT Representation", icon: ShieldCheck },
      ];
  if (!isAdmin && canViewSalesWaitlist(user)) {
    items.splice(items.length - 1, 0, {
      to: "/app/waitlist",
      label: "Sales waitlist",
      icon: Inbox,
    });
  }

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`${
        sidebarExpanded ? "w-64" : "w-16"
      } bg-bg-50 rounded-2xl my-3 mx-3 mr-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden border border-bd-50`}
    >
      {/* Header with Logo */}
      <div
        className={`flex items-center ${
          sidebarExpanded
            ? "justify-between pt-[20px] px-3"
            : "justify-center pt-[20px] px-2 pr-4"
        } pb-2`}
      >
        <div
          className={`flex items-center ${sidebarExpanded ? "px-1" : "pl-2"}`}
        >
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              {sidebarExpanded ? (
                <>
                  <Logo className="w-7 h-7" />
                  <span
                    className="ml-2 text-fg-50 text-xl font-normal"
                    style={{
                      fontFamily:
                        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
                    }}
                  >
                    Contia
                  </span>
                </>
              ) : (
                <Logo className="w-6 h-6" />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`${sidebarExpanded ? "px-2" : "px-1"} py-2`}>
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-2 px-2.5" : "justify-center px-2"
              } py-2 rounded-md transition-colors ${
                isActive(to)
                  ? "bg-[#582dee]/10 text-[#582dee] font-semibold"
                  : "hover:bg-bg-30 hover:text-fg-50 text-fg-60"
              }`}
              title={!sidebarExpanded ? label : ""}
            >
              <Icon size={18} />
              {sidebarExpanded && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="mt-auto">
        <div
          className={`relative ${sidebarExpanded ? "p-3" : "p-2"}`}
          ref={profileDropdownRef}
        >
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-full flex items-center p-2 rounded-lg hover:bg-bg-50/30 focus:bg-bg-50/40 transition-colors duration-150 outline-none ring-0 group ${
              !sidebarExpanded ? "justify-center" : ""
            }`}
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={showProfileDropdown}
            title={!sidebarExpanded ? user?.name || "User" : ""}
          >
            <div className="w-8 h-8 rounded-full bg-ac-02 flex items-center justify-center text-white dark:text-black text-sm font-medium flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {sidebarExpanded && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-fg-60 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            )}
            {sidebarExpanded && (
              <div className="ml-auto">
                {showProfileDropdown ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            )}
          </button>

          {showProfileDropdown && sidebarExpanded && (
            <div
              className="absolute bottom-full left-0 right-0 mb-2 z-50 min-w-[200px] px-2"
              style={{ pointerEvents: "auto" }}
            >
              <div className="bg-bg-60 border border-bd-50 shadow-lg rounded-lg py-1 transition-all duration-200 animate-fade-in">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-fg-50 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-fg-60 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/settings/change-password")}
                  className="w-full text-left px-4 py-2 text-sm text-fg-60 hover:bg-bg-40 hover:text-fg-80 focus:bg-bg-40 focus:text-fg-80 transition-colors flex items-center gap-2 rounded"
                >
                  <KeyRound size={16} className="text-fg-60" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-100 hover:text-red-600 focus:bg-red-100 focus:text-red-600 transition-colors flex items-center gap-2 rounded"
                >
                  <LogOut size={16} className="text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
