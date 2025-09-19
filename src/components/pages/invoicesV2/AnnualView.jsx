// Component for displaying annual summaries combining all four quarters
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    DollarSign,
    FileText,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Download,
    BarChart3,
    PieChart,
    Target
} from 'lucide-react';

const AnnualView = ({ selectedDate }) => {
    const [annualData, setAnnualData] = useState({});
    const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
    const [isLoading, setIsLoading] = useState(false);

    // Navigate to previous/next year
    const navigateYear = (direction) => {
        setCurrentYear(prev => prev + direction);
    };

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockAnnualData = {
                totalRevenue: 189002.50,
                totalInvoices: 288,
                paidInvoices: 260,
                pendingInvoices: 28,
                averageInvoiceValue: 656.27,
                yearOverYearGrowth: 15.8,
                profitMargin: 24.7,
                quarterlyBreakdown: [
                    { quarter: 'Q1', revenue: 47250.75, invoices: 72, growth: 8.7, taxes: 9450.15 },
                    { quarter: 'Q2', revenue: 52180.25, invoices: 78, growth: 10.4, taxes: 10436.05 },
                    { quarter: 'Q3', revenue: 45890.50, invoices: 69, growth: -12.1, taxes: 9178.10 },
                    { quarter: 'Q4', revenue: 43681.00, invoices: 69, growth: -4.8, taxes: 8736.20 }
                ],
                monthlyTrend: [
                    { month: 'Jan', revenue: 15750.50 },
                    { month: 'Feb', revenue: 16890.25 },
                    { month: 'Mar', revenue: 14610.00 },
                    { month: 'Apr', revenue: 17250.75 },
                    { month: 'May', revenue: 18430.50 },
                    { month: 'Jun', revenue: 16499.00 },
                    { month: 'Jul', revenue: 15890.25 },
                    { month: 'Aug', revenue: 14750.75 },
                    { month: 'Sep', revenue: 15249.50 },
                    { month: 'Oct', revenue: 14890.00 },
                    { month: 'Nov', revenue: 14291.50 },
                    { month: 'Dec', revenue: 14499.50 }
                ],
                totalTaxes: 37800.50,
                netProfit: 46650.62,
                topClients: [
                    { name: 'ABC Corporation', revenue: 28500.00, invoices: 24 },
                    { name: 'XYZ Ltd', revenue: 22750.50, invoices: 18 },
                    { name: 'Tech Startup Inc', revenue: 18900.25, invoices: 15 },
                    { name: 'Global Solutions', revenue: 16200.75, invoices: 12 }
                ]
            };
            setAnnualData(mockAnnualData);
            setIsLoading(false);
        }, 1200);
    }, [currentYear]);

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
            {/* Header with Year Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateYear(-1)}
                        className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-50">Annual Report {currentYear}</h2>
                        <p className="text-fg-60">Complete year overview and summary</p>
                    </div>
                    <button
                        onClick={() => navigateYear(1)}
                        className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors border border-bd-50">
                        <BarChart3 size={16} />
                        Analytics
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors">
                        <Download size={16} />
                        Export Annual
                    </button>
                </div>
            </div>

            {/* Annual Key Metrics */}
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
                        ${annualData.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +{annualData.yearOverYearGrowth}% from last year
                    </div>
                </div>

                {/* Net Profit */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Target size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Net Profit</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${annualData.netProfit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {annualData.profitMargin}% profit margin
                    </div>
                </div>

                {/* Total Invoices */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Invoices</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{annualData.totalInvoices}</div>
                    <div className="text-xs text-fg-60 mt-1">
                        {annualData.paidInvoices} paid, {annualData.pendingInvoices} pending
                    </div>
                </div>

                {/* Tax Liability */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <PieChart size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Taxes</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${annualData.totalTaxes?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {((annualData.totalTaxes / annualData.totalRevenue) * 100).toFixed(1)}% of revenue
                    </div>
                </div>
            </div>

            {/* Quarterly Performance */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Quarterly Performance</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {annualData.quarterlyBreakdown?.map((quarter, index) => (
                            <div key={index} className="bg-bg-50 rounded-lg p-6 border border-bd-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-fg-50">{quarter.quarter}</h4>
                                    <span className={`text-xs font-medium ${
                                        quarter.growth >= 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {quarter.growth >= 0 ? '+' : ''}{quarter.growth}%
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-fg-60">Revenue</div>
                                        <div className="text-xl font-bold text-fg-50">
                                            ${quarter.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-fg-60">Invoices</div>
                                        <div className="text-lg font-semibold text-fg-50">{quarter.invoices}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-fg-60">Taxes</div>
                                        <div className="text-lg font-semibold text-fg-50">
                                            ${quarter.taxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Progress bar showing contribution to year */}
                                <div className="mt-4">
                                    <div className="text-xs text-fg-60 mb-1">Year Contribution</div>
                                    <div className="bg-bg-40 rounded-full h-2">
                                        <div 
                                            className="bg-ac-02 h-2 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${(quarter.revenue / annualData.totalRevenue) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Trend */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Monthly Revenue Trend</h3>
                </div>
                <div className="p-6">
                    <div className="flex items-end gap-2 h-48">
                        {annualData.monthlyTrend?.map((month, index) => {
                            const maxRevenue = Math.max(...annualData.monthlyTrend.map(m => m.revenue));
                            const height = (month.revenue / maxRevenue) * 100;
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div 
                                        className="bg-ac-02 rounded-t-sm w-full transition-all duration-300 hover:bg-ac-01"
                                        style={{ height: `${height}%` }}
                                        title={`${month.month}: $${month.revenue.toLocaleString()}`}
                                    ></div>
                                    <div className="text-xs text-fg-60 mt-2">{month.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Clients */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Top Clients</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {annualData.topClients?.map((client, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-bg-50 rounded-lg border border-bd-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-ac-02 rounded-lg flex items-center justify-center text-white font-semibold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-fg-50">{client.name}</div>
                                        <div className="text-sm text-fg-60">{client.invoices} invoices</div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="font-semibold text-fg-50">
                                        ${client.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-fg-60">
                                        {((client.revenue / annualData.totalRevenue) * 100).toFixed(1)}% of total
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Annual Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Annual Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Download size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Tax Return</div>
                            <div className="text-xs text-fg-60">Generate annual tax return</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <BarChart3 size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Financial Report</div>
                            <div className="text-xs text-fg-60">Complete financial analysis</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Target size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Goal Planning</div>
                            <div className="text-xs text-fg-60">Set next year targets</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <PieChart size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Business Insights</div>
                            <div className="text-xs text-fg-60">Detailed analytics</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnualView;