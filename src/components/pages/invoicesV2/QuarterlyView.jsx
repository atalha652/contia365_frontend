// Component for displaying quarterly summaries and tax model connections
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    DollarSign,
    FileText,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Calculator,
    Download,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const QuarterlyView = ({ selectedDate }) => {
    const [quarterlyData, setQuarterlyData] = useState({});
    const [currentQuarter, setCurrentQuarter] = useState(getQuarter(selectedDate));
    const [isLoading, setIsLoading] = useState(false);

    // Get quarter information from date
    function getQuarter(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        const quarter = Math.floor(month / 3) + 1;
        return { quarter, year };
    }

    // Get quarter display name
    const getQuarterName = (quarterInfo) => {
        return `Q${quarterInfo.quarter} ${quarterInfo.year}`;
    };

    // Navigate to previous/next quarter
    const navigateQuarter = (direction) => {
        const newQuarter = { ...currentQuarter };
        newQuarter.quarter += direction;
        
        if (newQuarter.quarter > 4) {
            newQuarter.quarter = 1;
            newQuarter.year += 1;
        } else if (newQuarter.quarter < 1) {
            newQuarter.quarter = 4;
            newQuarter.year -= 1;
        }
        
        setCurrentQuarter(newQuarter);
    };

    // Get months in quarter
    const getQuarterMonths = (quarterInfo) => {
        const startMonth = (quarterInfo.quarter - 1) * 3;
        return [
            new Date(quarterInfo.year, startMonth, 1).toLocaleDateString('en-US', { month: 'long' }),
            new Date(quarterInfo.year, startMonth + 1, 1).toLocaleDateString('en-US', { month: 'long' }),
            new Date(quarterInfo.year, startMonth + 2, 1).toLocaleDateString('en-US', { month: 'long' })
        ];
    };

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockQuarterlyData = {
                totalRevenue: 47250.75,
                totalInvoices: 72,
                paidInvoices: 65,
                pendingInvoices: 7,
                averageInvoiceValue: 656.27,
                monthlyBreakdown: [
                    { month: getQuarterMonths(currentQuarter)[0], revenue: 15750.50, invoices: 24, growth: 12.5 },
                    { month: getQuarterMonths(currentQuarter)[1], revenue: 16890.25, invoices: 26, growth: 7.2 },
                    { month: getQuarterMonths(currentQuarter)[2], revenue: 14610.00, invoices: 22, growth: -13.5 }
                ],
                taxModels: [
                    { id: 'VAT', name: 'VAT Return', amount: 9450.15, status: 'pending', dueDate: '2024-04-30' },
                    { id: 'CORP', name: 'Corporate Tax', amount: 7087.61, status: 'calculated', dueDate: '2024-05-15' },
                    { id: 'PAYROLL', name: 'Payroll Tax', amount: 3256.89, status: 'submitted', dueDate: '2024-04-15' }
                ],
                quarterlyGrowth: 8.7,
                profitMargin: 23.4
            };
            setQuarterlyData(mockQuarterlyData);
            setIsLoading(false);
        }, 1000);
    }, [currentQuarter]);

    // Get status styling for tax models
    const getTaxStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case 'submitted':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            case 'calculated':
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
            case 'overdue':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-bg-40 rounded w-64 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                                <div className="h-4 bg-bg-40 rounded w-20 mb-2"></div>
                                <div className="h-8 bg-bg-40 rounded w-32"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Quarter Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateQuarter(-1)}
                        className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-50">{getQuarterName(currentQuarter)}</h2>
                        <p className="text-fg-60">{getQuarterMonths(currentQuarter).join(' • ')}</p>
                    </div>
                    <button
                        onClick={() => navigateQuarter(1)}
                        className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors border border-bd-50">
                        <Calculator size={16} />
                        Tax Calculator
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors">
                        <Download size={16} />
                        Export Quarter
                    </button>
                </div>
            </div>

            {/* Quarterly Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${quarterlyData.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +{quarterlyData.quarterlyGrowth}% from last quarter
                    </div>
                </div>

                {/* Total Invoices */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Invoices</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{quarterlyData.totalInvoices}</div>
                    <div className="text-xs text-fg-60 mt-1">
                        {quarterlyData.paidInvoices} paid, {quarterlyData.pendingInvoices} pending
                    </div>
                </div>

                {/* Profit Margin */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Profit Margin</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{quarterlyData.profitMargin}%</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        +2.1% from last quarter
                    </div>
                </div>

                {/* Tax Liability */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Calculator size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Tax Liability</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${quarterlyData.taxModels?.reduce((sum, tax) => sum + tax.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {quarterlyData.taxModels?.filter(t => t.status === 'pending').length} pending
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Monthly Breakdown</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quarterlyData.monthlyBreakdown?.map((month, index) => (
                            <div key={index} className="bg-bg-50 rounded-lg p-6 border border-bd-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-fg-50">{month.month}</h4>
                                    <span className={`text-xs font-medium ${
                                        month.growth >= 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {month.growth >= 0 ? '+' : ''}{month.growth}%
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-fg-60">Revenue</div>
                                        <div className="text-xl font-bold text-fg-50">
                                            ${month.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-fg-60">Invoices</div>
                                        <div className="text-lg font-semibold text-fg-50">{month.invoices}</div>
                                    </div>
                                </div>
                                
                                {/* Progress bar showing contribution to quarter */}
                                <div className="mt-4">
                                    <div className="text-xs text-fg-60 mb-1">Quarter Contribution</div>
                                    <div className="bg-bg-40 rounded-full h-2">
                                        <div 
                                            className="bg-ac-02 h-2 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${(month.revenue / quarterlyData.totalRevenue) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tax Models Section */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-fg-50">Tax Models & Compliance</h3>
                        <button className="flex items-center gap-2 px-3 py-1 bg-ac-02 hover:bg-ac-01 text-white rounded-md text-sm transition-colors">
                            <Calculator size={14} />
                            Calculate All
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="space-y-4">
                        {quarterlyData.taxModels?.map((tax) => (
                            <div key={tax.id} className="flex items-center justify-between p-4 bg-bg-50 rounded-lg border border-bd-50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <Calculator size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-fg-50">{tax.name}</div>
                                        <div className="text-sm text-fg-60">Due: {tax.dueDate}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-semibold text-fg-50">
                                            ${tax.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                        <span className={getTaxStatusBadge(tax.status)}>
                                            {tax.status.charAt(0).toUpperCase() + tax.status.slice(1)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        {tax.status === 'submitted' ? (
                                            <CheckCircle size={20} className="text-green-600" />
                                        ) : tax.status === 'overdue' ? (
                                            <AlertCircle size={20} className="text-red-600" />
                                        ) : (
                                            <AlertCircle size={20} className="text-yellow-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quarter Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Quarter Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <TrendingUp size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">View Annual</div>
                            <div className="text-xs text-fg-60">Go to annual summary</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Download size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Tax Report</div>
                            <div className="text-xs text-fg-60">Generate quarterly tax report</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Calculator size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Tax Planning</div>
                            <div className="text-xs text-fg-60">Plan next quarter taxes</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuarterlyView;