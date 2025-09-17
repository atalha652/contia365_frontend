// frontend/src/components/pages/projects/Sidebar.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { User, ChevronDown, LogOut } from "lucide-react";

// Skeleton loader component
const SidebarSkeleton = () => (
    <div className="animate-pulse">
        <div className="flex items-center justify-between pt-[14px] px-3 pb-2">
            <div className="flex items-center">
                <div className="h-8 w-8 bg-bg-40 rounded"></div>
                <div className="ml-2 h-4 bg-bg-40 rounded w-16"></div>
            </div>
            <div className="h-6 w-6 bg-bg-40 rounded"></div>
        </div>
        <div className="px-3 py-4 space-y-1">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center px-2 py-2">
                    <div className="h-4 w-4 bg-bg-40 rounded mr-3"></div>
                    <div className="h-4 bg-bg-40 rounded w-20"></div>
                </div>
            ))}
        </div>
    </div>
);

const Sidebar = ({
    sidebarExpanded,
    isLoading,
    PanelLeft,
    FolderOpen,
}) => {
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Get user data directly from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("user");
        setTimeout(() => {
            window.location.href = "/sign-in";
        }, 1500);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        if (showUserDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserDropdown]);
    return (
        <div
            className={`${sidebarExpanded ? "w-64" : "w-0"
                } border-r border-bd-50 bg-bg-60 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
        >
            {isLoading ? (
                <SidebarSkeleton />
            ) : (
                <>
                    {/* Header with Logo and Search */}
                    <div className="flex items-center justify-between pt-[14px] px-3 pb-2">
                        <div className="flex items-center">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link to="/" className="flex items-center">
                                    <img src="/logo.png" alt="Logo" className="h-7 w-7 mr-2" />
                                    <span className="text-lg font-bold text-fg-50 ml-0.5 tracking-wider">CONTIA365</span>
                                    {user?.role && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-bg-40 text-fg-60">
                                            {user.role.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        <div className="px-3 py-4 space-y-1">
                            <NavLink
                                to="."
                                end
                                className={({ isActive }) =>
                                    `flex items-center w-full px-2 py-2 text-sm rounded-md ${isActive
                                        ? "bg-bg-40 text-fg-50"
                                        : "text-fg-60 hover:bg-bg-50/20"
                                    }`
                                }
                            >
                                <PanelLeft size={18} className="mr-3" />
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="list"
                                className={({ isActive }) =>
                                    `flex items-center w-full px-2 py-2 text-sm rounded-md ${isActive
                                        ? "bg-bg-40 text-fg-50"
                                        : "text-fg-60 hover:bg-bg-50/20"
                                    }`
                                }
                            >
                                <FolderOpen size={18} className="mr-3" />
                                <span>Invoices</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="p-3">
                        <div className="space-y-1">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="w-full p-3 flex items-center hover:bg-bg-50 rounded-md cursor-pointer transition-colors"
                                >
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-ac-02 flex items-center justify-center text-white shadow-sm">
                                        <User size={16} />
                                    </div>
                                    {sidebarExpanded && (
                                        <>
                                            <div className="ml-3 overflow-hidden flex-1 text-left">
                                                <p className="text-sm font-medium truncate">
                                                    {user?.name || "User"}
                                                </p>
                                                <p className="text-xs text-fg-60 truncate">
                                                    {user?.email || "No email"}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-fg-60 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                                            />
                                        </>
                                    )}
                                </button>

                                {/* User Dropdown */}
                                {showUserDropdown && sidebarExpanded && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-60 rounded-md border border-bd-50 z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setShowUserDropdown(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Sidebar;