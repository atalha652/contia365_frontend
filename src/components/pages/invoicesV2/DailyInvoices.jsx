// Component for displaying daily invoice overview and management
import React, { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    DollarSign,
    Calendar,
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    Download
} from 'lucide-react';

const DailyInvoices = ({ selectedDate }) => {
    const [dailyInvoices, setDailyInvoices] = useState([]);
    const [dailyTotal, setDailyTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data for demonstration - replace with actual API calls
    useEffect(() => {
        // Simulate loading daily invoices
        setIsLoading(true);
        setTimeout(() => {
            const mockInvoices = [
                {
                    id: 1,
                    title: "Client A - Project Invoice",
                    amount: 1250.00,
                    status: "paid",
                    time: "09:30 AM",
                    client: "ABC Corporation",
                    invoiceNumber: "INV-2024-001"
                },
                {
                    id: 2,
                    title: "Consulting Services",
                    amount: 850.00,
                    status: "pending",
                    time: "11:15 AM",
                    client: "XYZ Ltd",
                    invoiceNumber: "INV-2024-002"
                },
                {
                    id: 3,
                    title: "Monthly Subscription",
                    amount: 299.99,
                    status: "paid",
                    time: "02:45 PM",
                    client: "Tech Startup Inc",
                    invoiceNumber: "INV-2024-003"
                }
            ];
            setDailyInvoices(mockInvoices);
            setDailyTotal(mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0));
            setIsLoading(false);
        }, 1000);
    }, [selectedDate]);

    // Get status badge styling
    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case 'paid':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
            case 'overdue':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
        }
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Loading skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-bg-40 rounded w-64 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                                <div className="h-4 bg-bg-40 rounded w-20 mb-2"></div>
                                <div className="h-8 bg-bg-40 rounded w-32"></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                        <div className="h-6 bg-bg-40 rounded w-40 mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-bg-40 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-fg-50">Daily Overview</h2>
                    <p className="text-fg-60">{formatDate(selectedDate)}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors">
                    <Plus size={16} />
                    New Invoice
                </button>
            </div>

            {/* Daily Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Daily Total</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${dailyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Invoice Count */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Invoices Today</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{dailyInvoices.length}</div>
                </div>

                {/* Pending Amount */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <TrendingUp size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${dailyInvoices
                            .filter(inv => inv.status === 'pending')
                            .reduce((sum, inv) => sum + inv.amount, 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Daily Invoices List */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Today's Invoices</h3>
                </div>

                {dailyInvoices.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText size={48} className="text-fg-60 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-fg-50 mb-2">No invoices today</h4>
                        <p className="text-fg-60">Create your first invoice for today to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-bd-50">
                        {dailyInvoices.map((invoice) => (
                            <div key={invoice.id} className="p-6 hover:bg-bg-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-medium text-fg-50">{invoice.title}</h4>
                                            <span className={getStatusBadge(invoice.status)}>
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-fg-60">
                                            <span>{invoice.client}</span>
                                            <span>•</span>
                                            <span>{invoice.invoiceNumber}</span>
                                            <span>•</span>
                                            <span>{invoice.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-fg-50">
                                                ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1">
                                            <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-lg transition-colors">
                                                <Download size={16} />
                                            </button>
                                            <button className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Plus size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Create Invoice</div>
                            <div className="text-xs text-fg-60">New invoice for today</div>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Calendar size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">View Monthly</div>
                            <div className="text-xs text-fg-60">Go to monthly view</div>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Download size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Export Daily</div>
                            <div className="text-xs text-fg-60">Download today's report</div>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <TrendingUp size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Analytics</div>
                            <div className="text-xs text-fg-60">View daily trends</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyInvoices;