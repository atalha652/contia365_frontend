// Main page for the new hierarchical invoice management system
import { useState, useEffect } from "react";
import { updatePageTitle } from "../utils/titleUtils";
import { useTheme } from "../context/ThemeContext";
import {
    PanelLeftDashed,
    PanelLeft,
    Moon,
    Sun,
    Calendar,
    TrendingUp,
    FileText,
    Bell,
    CreditCard
} from "lucide-react";

// Import v2 components
import DailyInvoices from "../components/pages/invoicesV2/DailyInvoices";
import MonthlyView from "../components/pages/invoicesV2/MonthlyView";
import QuarterlyView from "../components/pages/invoicesV2/QuarterlyView";
import AnnualView from "../components/pages/invoicesV2/AnnualView";
import InvestmentGoods from "../components/pages/invoicesV2/InvestmentGoods";
import LoansTracking from "../components/pages/invoicesV2/LoansTracking";
// import NotificationsPanel from "../components/pages/invoicesV2/NotificationsPanel";
import DebtsManagement from "../components/pages/invoicesV2/DebtsManagement";

const InvoicesV2 = () => {
    const { theme, toggleTheme } = useTheme();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [activeView, setActiveView] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    useEffect(() => {
        updatePageTitle('Invoice Management V2');
    }, []);

    // Navigation items for the main content area
    const navigationItems = [
        { id: 'daily', label: 'Today', icon: Calendar, description: 'Daily invoice overview' },
        { id: 'monthly', label: 'Monthly', icon: FileText, description: 'Monthly summaries' },
        { id: 'quarterly', label: 'Quarterly', icon: TrendingUp, description: 'Quarterly reports' },
        { id: 'annual', label: 'Annual', icon: TrendingUp, description: 'Annual overview' },
        { id: 'investments', label: 'Investments', icon: TrendingUp, description: 'Investment goods tracking' },
        { id: 'loans', label: 'Loans', icon: CreditCard, description: 'Loan management' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'System notifications' },
        { id: 'debts', label: 'Debts', icon: CreditCard, description: 'Debt management' }
    ];

    // Render the appropriate component based on active view
    const renderActiveView = () => {
        switch (activeView) {
            case 'daily':
                return <DailyInvoices selectedDate={selectedDate} />;
            case 'monthly':
                return <MonthlyView selectedDate={selectedDate} />;
            case 'quarterly':
                return <QuarterlyView selectedDate={selectedDate} />;
            case 'annual':
                return <AnnualView selectedDate={selectedDate} />;
            case 'investments':
                return <InvestmentGoods />;
            case 'loans':
                return <LoansTracking />;
            case 'notifications':
                return <NotificationsPanel />;
            case 'debts':
                return <DebtsManagement />;
            default:
                return <DailyInvoices selectedDate={selectedDate} />;
        }
    };

    return (
        <div className="flex h-screen bg-bg-50 text-fg-50 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className={`${sidebarExpanded ? 'w-64' : 'w-16'} transition-all duration-300 bg-bg-60 border-r border-bd-50 flex flex-col`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-bd-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-ac-02 rounded-lg flex items-center justify-center">
                            <FileText size={16} className="text-white" />
                        </div>
                        {sidebarExpanded && (
                            <div>
                                <h2 className="font-semibold text-fg-50">Invoice Manager</h2>
                                <p className="text-xs text-fg-60">V2 System</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-2 space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-ac-02 text-white' 
                                        : 'text-fg-60 hover:bg-bg-50 hover:text-fg-50'
                                }`}
                                title={sidebarExpanded ? '' : item.label}
                            >
                                <Icon size={20} />
                                {sidebarExpanded && (
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{item.label}</div>
                                        <div className="text-xs opacity-75">{item.description}</div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
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
                        <div>
                            <h1 className="text-lg font-semibold">
                                {navigationItems.find(item => item.id === activeView)?.label || 'Dashboard'}
                            </h1>
                            <p className="text-xs text-fg-60">
                                {navigationItems.find(item => item.id === activeView)?.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Date Picker for time-based views */}
                        {['daily', 'monthly', 'quarterly', 'annual'].includes(activeView) && (
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="px-3 py-1 text-xs border border-bd-50 rounded-md bg-bg-60 text-fg-50 focus:outline-none focus:ring-1 focus:ring-ac-02"
                            />
                        )}
                        
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

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {renderActiveView()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicesV2;