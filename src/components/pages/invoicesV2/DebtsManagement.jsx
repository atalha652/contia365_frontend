// Component for managing and tracking business debts
import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Target,
    FileText
} from 'lucide-react';

const DebtsManagement = () => {
    const [debts, setDebts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockDebts = [
                {
                    id: 1,
                    creditor: 'Office Supplies Inc.',
                    debtType: 'Trade Payable',
                    originalAmount: 5500.00,
                    currentBalance: 3200.00,
                    paidAmount: 2300.00,
                    dueDate: '2024-12-15',
                    createdDate: '2024-10-01',
                    interestRate: 0,
                    status: 'Active',
                    priority: 'Medium',
                    description: 'Office furniture and supplies purchase',
                    paymentTerms: 'Net 30',
                    contactInfo: 'accounts@officesupplies.com'
                },
                {
                    id: 2,
                    creditor: 'Tech Solutions Ltd',
                    debtType: 'Service Debt',
                    originalAmount: 12000.00,
                    currentBalance: 12000.00,
                    paidAmount: 0.00,
                    dueDate: '2024-12-01',
                    createdDate: '2024-11-01',
                    interestRate: 1.5,
                    status: 'Overdue',
                    priority: 'High',
                    description: 'Software development services',
                    paymentTerms: 'Net 15',
                    contactInfo: 'billing@techsolutions.com'
                },
                {
                    id: 3,
                    creditor: 'Utility Company',
                    debtType: 'Utility Bill',
                    originalAmount: 850.00,
                    currentBalance: 850.00,
                    paidAmount: 0.00,
                    dueDate: '2024-12-20',
                    createdDate: '2024-11-20',
                    interestRate: 0,
                    status: 'Active',
                    priority: 'High',
                    description: 'Monthly electricity and water bills',
                    paymentTerms: 'Due on receipt',
                    contactInfo: 'billing@utility.com'
                },
                {
                    id: 4,
                    creditor: 'Marketing Agency Pro',
                    debtType: 'Service Debt',
                    originalAmount: 8500.00,
                    currentBalance: 4250.00,
                    paidAmount: 4250.00,
                    dueDate: '2025-01-15',
                    createdDate: '2024-09-15',
                    interestRate: 0,
                    status: 'Active',
                    priority: 'Low',
                    description: 'Digital marketing campaign services',
                    paymentTerms: 'Net 45',
                    contactInfo: 'finance@marketingpro.com'
                },
                {
                    id: 5,
                    creditor: 'Equipment Rental Co',
                    debtType: 'Equipment Lease',
                    originalAmount: 3600.00,
                    currentBalance: 1200.00,
                    paidAmount: 2400.00,
                    dueDate: '2024-12-31',
                    createdDate: '2024-07-01',
                    interestRate: 0,
                    status: 'Active',
                    priority: 'Medium',
                    description: 'Monthly equipment rental fees',
                    paymentTerms: 'Monthly',
                    contactInfo: 'leasing@equipmentrental.com'
                },
                {
                    id: 6,
                    creditor: 'Legal Services LLC',
                    debtType: 'Professional Service',
                    originalAmount: 4500.00,
                    currentBalance: 0.00,
                    paidAmount: 4500.00,
                    dueDate: '2024-10-30',
                    createdDate: '2024-09-01',
                    interestRate: 0,
                    status: 'Paid',
                    priority: 'Low',
                    description: 'Legal consultation and contract review',
                    paymentTerms: 'Net 30',
                    contactInfo: 'billing@legalservices.com'
                }
            ];
            setDebts(mockDebts);
            setIsLoading(false);
        }, 800);
    }, []);

    // Filter debts based on search, type, and status
    const filteredDebts = debts.filter(debt => {
        const matchesSearch = debt.creditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            debt.debtType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || debt.debtType === filterType;
        const matchesStatus = filterStatus === 'all' || debt.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesType && matchesStatus;
    });

    // Calculate totals
    const totalOriginalAmount = debts.reduce((sum, debt) => sum + debt.originalAmount, 0);
    const totalCurrentBalance = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const totalPaidAmount = debts.reduce((sum, debt) => sum + debt.paidAmount, 0);
    const overdueDebts = debts.filter(debt => debt.status === 'Overdue').length;

    // Get unique types and statuses for filters
    const debtTypes = ['all', ...new Set(debts.map(debt => debt.debtType))];
    const statuses = ['all', ...new Set(debts.map(debt => debt.status))];

    // Get status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'overdue':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'paid':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'medium':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'low':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
        }
    };

    // Calculate progress percentage
    const getProgressPercentage = (paidAmount, originalAmount) => {
        return (paidAmount / originalAmount) * 100;
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-fg-50">Debts Management</h2>
                    <p className="text-fg-60">Track and manage business debts and payables</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Add Debt
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Debt */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <CreditCard size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Debt</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalOriginalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-fg-60 mt-1">
                        Original amounts
                    </div>
                </div>

                {/* Outstanding Balance */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <TrendingUp size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Outstanding</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalCurrentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Remaining balance
                    </div>
                </div>

                {/* Total Paid */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Paid</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {((totalPaidAmount / totalOriginalAmount) * 100).toFixed(1)}% of total
                    </div>
                </div>

                {/* Overdue Count */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Overdue</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{overdueDebts}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Need attention
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <input
                        type="text"
                        placeholder="Search debts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                    />
                </div>
                
                <div className="relative">
                    <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent appearance-none"
                    >
                        {debtTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Types' : type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-4 pr-8 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent appearance-none"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All Status' : status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Debts List */}
            <div className="space-y-4">
                {filteredDebts.map((debt) => {
                    const progressPercentage = getProgressPercentage(debt.paidAmount, debt.originalAmount);
                    const isOverdue = new Date(debt.dueDate) < new Date() && debt.status !== 'Paid';
                    
                    return (
                        <div key={debt.id} className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                            <div className="p-6">
                                {/* Debt Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-fg-50">{debt.creditor}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                                                {debt.status}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(debt.priority)}`}>
                                                {debt.priority}
                                            </span>
                                            {isOverdue && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-fg-60 mb-1">{debt.debtType}</div>
                                        <div className="text-sm text-fg-60">{debt.description}</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 text-fg-60 hover:text-red-500 hover:bg-bg-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Debt Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Original Amount</div>
                                        <div className="text-lg font-semibold text-fg-50">
                                            ${debt.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Amount Paid</div>
                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            ${debt.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Outstanding</div>
                                        <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            ${debt.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Due Date</div>
                                        <div className={`text-lg font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-fg-50'}`}>
                                            {new Date(debt.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-fg-60">Payment Progress</span>
                                        <span className="text-sm font-medium text-fg-50">
                                            {progressPercentage.toFixed(1)}% Paid
                                        </span>
                                    </div>
                                    <div className="bg-bg-40 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-fg-60 mt-1">
                                        <span>Paid: ${debt.paidAmount.toLocaleString()}</span>
                                        <span>Remaining: ${debt.currentBalance.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-bd-50">
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Payment Terms</div>
                                        <div className="text-sm font-medium text-fg-50">{debt.paymentTerms}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Interest Rate</div>
                                        <div className="text-sm font-medium text-fg-50">
                                            {debt.interestRate > 0 ? `${debt.interestRate}%` : 'No Interest'}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Contact</div>
                                        <div className="text-sm font-medium text-fg-50">{debt.contactInfo}</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-bd-50">
                                    <button className="px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors text-sm">
                                        Make Payment
                                    </button>
                                    <button className="px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors text-sm border border-bd-50">
                                        Contact Creditor
                                    </button>
                                    <button className="px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors text-sm border border-bd-50">
                                        Set Reminder
                                    </button>
                                    {debt.status !== 'Paid' && (
                                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
                                            Mark as Paid
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Plus size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Add Debt</div>
                            <div className="text-xs text-fg-60">Register new debt</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <DollarSign size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Bulk Payment</div>
                            <div className="text-xs text-fg-60">Pay multiple debts</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Calendar size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Payment Schedule</div>
                            <div className="text-xs text-fg-60">View payment calendar</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <FileText size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Debt Report</div>
                            <div className="text-xs text-fg-60">Generate report</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebtsManagement;