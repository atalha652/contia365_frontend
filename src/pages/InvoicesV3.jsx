// InvoicesV3 page with collapsible sidebar structure similar to Figma's layers panel
import { useState, useEffect } from "react";
import { updatePageTitle } from "../utils/titleUtils";
import {
    PanelLeftDashed,
    PanelLeft,
    Moon,
    Sun,
    ChevronRight,
    ChevronDown,
    Calendar,
    FileText,
    BarChart3
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Header skeleton component for loading state
const HeaderSkeleton = () => (
    <div className="animate-pulse">
        <div className="flex items-center justify-between px-6 py-3 border-b border-bd-50">
            <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-bg-40 rounded"></div>
                <div className="h-6 bg-bg-40 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-bg-40 rounded-full"></div>
            </div>
        </div>
    </div>
);

// Sidebar skeleton component for loading state
const SidebarSkeleton = () => (
    <div className="animate-pulse p-3">
        <div className="space-y-2">
            {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center px-2 py-2">
                    <div className="h-4 w-4 bg-bg-40 rounded mr-3"></div>
                    <div className="h-4 bg-bg-40 rounded w-20"></div>
                </div>
            ))}
        </div>
    </div>
);

// Content skeleton component for loading state
const ContentSkeleton = () => (
    <div className="animate-pulse p-6">
        <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
                <div className="bg-bg-60 rounded-lg p-6">
                    <div className="h-8 bg-bg-40 rounded w-64 mb-4"></div>
                    <div className="h-4 bg-bg-40 rounded w-96"></div>
                </div>
            </div>
        </div>
    </div>
);

const InvoicesV3 = () => {
    const { theme, toggleTheme } = useTheme();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState("Dashboard");
    
    // State for managing expanded/collapsed items in sidebar
    const [expandedItems, setExpandedItems] = useState({
        invoices: false,
        trimester01: false,
        trimester02: false,
        trimester03: false,
        trimester04: false
    });

    // Simulate loading
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        updatePageTitle('Invoices V3');
    }, []);

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    // Toggle expanded state for sidebar items
    const toggleExpanded = (itemKey) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemKey]: !prev[itemKey]
        }));
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    // Render content based on selected option
    const renderContent = () => {
        return (
            <div className="bg-bg-60 rounded-lg p-8 border border-bd-50">
                <div className="text-center">
                    <div className="mb-4">
                        <FileText size={48} className="mx-auto text-fg-60 mb-4" />
                    </div>
                    <h2 className="text-2xl font-bold text-fg-50 mb-2">
                        Invoices of {selectedOption}
                    </h2>
                    <p className="text-fg-60">
                        This section will display the invoices for {selectedOption.toLowerCase()}.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-bg-50 text-fg-50 overflow-hidden">
            {/* Sidebar */}
            <div
                className={`${sidebarExpanded ? "w-64" : "w-0"
                    } border-r border-bd-50 bg-bg-60 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
            >
                {isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <>
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between pt-[14px] px-3 pb-2">
                            <div className="flex items-center">
                                <img src="/logo.png" alt="Logo" className="h-7 w-7 mr-2" />
                                <span className="text-lg font-bold text-fg-50 ml-0.5 tracking-wider">CONTIA365</span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            <div className="px-3 py-4 space-y-1">
                                {/* Dashboard */}
                                <button
                                    onClick={() => handleOptionSelect("Dashboard")}
                                    className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                                        selectedOption === "Dashboard"
                                            ? "bg-bg-40 text-fg-50"
                                            : "text-fg-60 hover:bg-bg-50/20"
                                    }`}
                                >
                                    {/* Space to align with chevron icons */}
                                    <div className="w-[18px] mr-3"></div>
                                    <PanelLeft size={18} className="mr-3" />
                                    <span>Dashboard</span>
                                </button>

                                {/* Invoices with collapsible structure */}
                                <div>
                                    <button
                                        onClick={() => toggleExpanded('invoices')}
                                        className="flex items-center w-full px-2 py-2 text-sm rounded-md text-fg-60 hover:bg-bg-50/20 transition-colors"
                                    >
                                        {expandedItems.invoices ? (
                                            <ChevronDown size={18} className="mr-3" />
                                        ) : (
                                            <ChevronRight size={18} className="mr-3" />
                                        )}
                                        <FileText size={18} className="mr-3" />
                                        <span>Invoices</span>
                                    </button>

                                    {/* Collapsible content for Invoices */}
                                    {expandedItems.invoices && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {/* Trimester 01 */}
                                            <div>
                                                <button
                                                    onClick={() => toggleExpanded('trimester01')}
                                                    className="flex items-center w-full px-2 py-2 text-sm rounded-md text-fg-60 hover:bg-bg-50/20 transition-colors"
                                                >
                                                    {expandedItems.trimester01 ? (
                                                        <ChevronDown size={18} className="mr-3" />
                                                    ) : (
                                                        <ChevronRight size={18} className="mr-3" />
                                                    )}
                                                    <span>Trimester 01</span>
                                                </button>

                                                {/* Months for Trimester 01 */}
                                                {expandedItems.trimester01 && (
                                                    <div className="ml-6 space-y-1">
                                                        {['January', 'February', 'March'].map((month) => (
                                                            <button
                                                                key={month}
                                                                onClick={() => handleOptionSelect(month)}
                                                                className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                                                                    selectedOption === month
                                                                        ? "bg-bg-40 text-fg-50"
                                                                        : "text-fg-60 hover:bg-bg-50/20"
                                                                }`}
                                                            >
                                                                {/* Space to align with chevron icons */}
                                                                <div className="w-[18px] mr-3"></div>
                                                                <span>{month}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Trimester 02 */}
                                            <div>
                                                <button
                                                    onClick={() => toggleExpanded('trimester02')}
                                                    className="flex items-center w-full px-2 py-2 text-sm rounded-md text-fg-60 hover:bg-bg-50/20 transition-colors"
                                                >
                                                    {expandedItems.trimester02 ? (
                                                        <ChevronDown size={18} className="mr-3" />
                                                    ) : (
                                                        <ChevronRight size={18} className="mr-3" />
                                                    )}
                                                    <span>Trimester 02</span>
                                                </button>

                                                {/* Months for Trimester 02 */}
                                                {expandedItems.trimester02 && (
                                                    <div className="ml-6 space-y-1">
                                                        {['April', 'May', 'June'].map((month) => (
                                                            <button
                                                                key={month}
                                                                onClick={() => handleOptionSelect(month)}
                                                                className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                                                                    selectedOption === month
                                                                        ? "bg-bg-40 text-fg-50"
                                                                        : "text-fg-60 hover:bg-bg-50/20"
                                                                }`}
                                                            >
                                                                {/* Space to align with chevron icons */}
                                                                <div className="w-[18px] mr-3"></div>
                                                                <span>{month}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Trimester 03 */}
                                            <div>
                                                <button
                                                    onClick={() => toggleExpanded('trimester03')}
                                                    className="flex items-center w-full px-2 py-2 text-sm rounded-md text-fg-60 hover:bg-bg-50/20 transition-colors"
                                                >
                                                    {expandedItems.trimester03 ? (
                                                        <ChevronDown size={18} className="mr-3" />
                                                    ) : (
                                                        <ChevronRight size={18} className="mr-3" />
                                                    )}
                                                    <span>Trimester 03</span>
                                                </button>

                                                {/* Months for Trimester 03 */}
                                                {expandedItems.trimester03 && (
                                                    <div className="ml-6 space-y-1">
                                                        {['July', 'August', 'September'].map((month) => (
                                                            <button
                                                                key={month}
                                                                onClick={() => handleOptionSelect(month)}
                                                                className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                                                                    selectedOption === month
                                                                        ? "bg-bg-40 text-fg-50"
                                                                        : "text-fg-60 hover:bg-bg-50/20"
                                                                }`}
                                                            >
                                                                {/* Space to align with chevron icons */}
                                                                <div className="w-[18px] mr-3"></div>
                                                                <span>{month}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Trimester 04 */}
                                            <div>
                                                <button
                                                    onClick={() => toggleExpanded('trimester04')}
                                                    className="flex items-center w-full px-2 py-2 text-sm rounded-md text-fg-60 hover:bg-bg-50/20 transition-colors"
                                                >
                                                    {expandedItems.trimester04 ? (
                                                        <ChevronDown size={18} className="mr-3" />
                                                    ) : (
                                                        <ChevronRight size={18} className="mr-3" />
                                                    )}
                                                    <span>Trimester 04</span>
                                                </button>

                                                {/* Months for Trimester 04 */}
                                                {expandedItems.trimester04 && (
                                                    <div className="ml-6 space-y-1">
                                                        {['October', 'November', 'December'].map((month) => (
                                                            <button
                                                                key={month}
                                                                onClick={() => handleOptionSelect(month)}
                                                                className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                                                                    selectedOption === month
                                                                        ? "bg-bg-40 text-fg-50"
                                                                        : "text-fg-60 hover:bg-bg-50/20"
                                                                }`}
                                                            >
                                                                {/* Space to align with chevron icons */}
                                                                <div className="w-[18px] mr-3"></div>
                                                                <span>{month}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Annual option */}
                                            <button
                                                onClick={() => handleOptionSelect("Annual")}
                                                className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                                                    selectedOption === "Annual"
                                                        ? "bg-bg-40 text-fg-50"
                                                        : "text-fg-60 hover:bg-bg-50/20"
                                                }`}
                                            >
                                                {/* Space to align with chevron icons */}
                                                <div className="w-[18px] mr-3"></div>
                                                <Calendar size={18} className="mr-3" />
                                                <span>Annual</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                {isLoading ? (
                    <HeaderSkeleton />
                ) : (
                    <div className="flex items-center justify-between px-6 py-3 border-b border-bd-50">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 text-fg-60 hover:text-fg-50 transition-colors"
                            >
                                {sidebarExpanded ? (
                                    <PanelLeftDashed size={20} />
                                ) : (
                                    <PanelLeft size={20} />
                                )}
                            </button>
                            <h1 className="text-lg font-semibold">
                                {selectedOption}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-fg-60 hover:text-fg-50 transition-colors rounded-md hover:bg-bg-50"
                                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                            >
                                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {isLoading ? (
                            <ContentSkeleton />
                        ) : (
                            renderContent()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicesV3;