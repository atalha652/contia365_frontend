// Component for displaying monthly invoice summaries and organization
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    DollarSign,
    FileText,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Eye,
    Download
} from 'lucide-react';

const MonthlyView = ({ selectedDate }) => {
    const [monthlyData, setMonthlyData] = useState({});
    const [currentMonth, setCurrentMonth] = useState(selectedDate);
    const [isLoading, setIsLoading] = useState(false);

    // Get month name and year
    const getMonthYear = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Navigate to previous/next month
    const navigateMonth = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentMonth(newDate);
    };

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockMonthlyData = {
                totalRevenue: 15750.50,
                totalInvoices: 24,
                paidInvoices: 18,
                pendingInvoices: 6,
                averageInvoiceValue: 656.27,
                weeklyBreakdown: [
                    { week: 'Week 1', revenue: 4250.00, invoices: 6 },
                    { week: 'Week 2', revenue: 3890.25, invoices: 5 },
                    { week: 'Week 3', revenue: 4120.75, invoices: 7 },
                    { week: 'Week 4', revenue: 3489.50, invoices: 6 }
                ],
                dailyBreakdown: Array.from({ length: 30 }, (_, i) => ({
                    day: i + 1,
                    revenue: Math.random() * 1000 + 200,
                    invoices: Math.floor(Math.random() * 3) + 1
                }))
            };
            setMonthlyData(mockMonthlyData);
            setIsLoading(false);
        }, 800);
    }, [currentMonth]);

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
            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-50">{getMonthYear(currentMonth)}</h2>
                        <p className="text-fg-60">Monthly Overview</p>
                    </div>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors border border-bd-50">
                        <Download size={16} />
                        Export Month
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors">
                        <Eye size={16} />
                        View Details
                    </button>
                </div>
            </div>

            {/* Monthly Statistics */}
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
                        ${monthlyData.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +12.5% from last month
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
                    <div className="text-2xl font-bold text-fg-50">{monthlyData.totalInvoices}</div>
                    <div className="text-xs text-fg-60 mt-1">
                        {monthlyData.paidInvoices} paid, {monthlyData.pendingInvoices} pending
                    </div>
                </div>

                {/* Average Invoice Value */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Average Value</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${monthlyData.averageInvoiceValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        +5.2% from last month
                    </div>
                </div>

                {/* Payment Rate */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Payment Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        {Math.round((monthlyData.paidInvoices / monthlyData.totalInvoices) * 100)}%
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {monthlyData.paidInvoices} of {monthlyData.totalInvoices} paid
                    </div>
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Weekly Breakdown</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {monthlyData.weeklyBreakdown?.map((week, index) => (
                            <div key={index} className="bg-bg-50 rounded-lg p-4 border border-bd-50">
                                <div className="text-sm font-medium text-fg-60 mb-2">{week.week}</div>
                                <div className="text-xl font-bold text-fg-50 mb-1">
                                    ${week.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-fg-60">{week.invoices} invoices</div>
                                
                                {/* Simple progress bar */}
                                <div className="mt-3 bg-bg-40 rounded-full h-2">
                                    <div 
                                        className="bg-ac-02 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${(week.revenue / Math.max(...monthlyData.weeklyBreakdown.map(w => w.revenue))) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Daily Revenue Chart (Simple Bar Chart) */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Daily Revenue Trend</h3>
                </div>
                <div className="p-6">
                    <div className="flex items-end gap-1 h-40">
                        {monthlyData.dailyBreakdown?.slice(0, 30).map((day, index) => {
                            const maxRevenue = Math.max(...monthlyData.dailyBreakdown.map(d => d.revenue));
                            const height = (day.revenue / maxRevenue) * 100;
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div 
                                        className="bg-ac-02 rounded-t-sm w-full transition-all duration-300 hover:bg-ac-01"
                                        style={{ height: `${height}%` }}
                                        title={`Day ${day.day}: $${day.revenue.toFixed(2)}`}
                                    ></div>
                                    {index % 5 === 0 && (
                                        <div className="text-xs text-fg-60 mt-1">{day.day}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Month Summary Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Month Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <TrendingUp size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">View Quarterly</div>
                            <div className="text-xs text-fg-60">Go to quarterly summary</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Download size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Generate Report</div>
                            <div className="text-xs text-fg-60">Monthly financial report</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <FileText size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Tax Preparation</div>
                            <div className="text-xs text-fg-60">Prepare monthly tax data</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonthlyView;