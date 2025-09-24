// Component for tracking loans with progress bars and payment management
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
    Percent,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

const LoansTracking = () => {
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockLoans = [
                {
                    id: 1,
                    loanNumber: 'BL-2023-001',
                    lender: 'Business Bank Corp',
                    purpose: 'Equipment Purchase',
                    originalAmount: 50000.00,
                    currentBalance: 32500.00,
                    paidAmount: 17500.00,
                    interestRate: 5.5,
                    startDate: '2023-01-15',
                    endDate: '2028-01-15',
                    monthlyPayment: 950.00,
                    nextPaymentDate: '2024-12-15',
                    status: 'Active',
                    paymentHistory: [
                        { date: '2024-11-15', amount: 950.00, principal: 720.00, interest: 230.00 },
                        { date: '2024-10-15', amount: 950.00, principal: 715.00, interest: 235.00 }
                    ]
                },
                {
                    id: 2,
                    loanNumber: 'BL-2023-002',
                    lender: 'Capital Finance Ltd',
                    purpose: 'Business Expansion',
                    originalAmount: 75000.00,
                    currentBalance: 58200.00,
                    paidAmount: 16800.00,
                    interestRate: 6.2,
                    startDate: '2023-06-01',
                    endDate: '2030-06-01',
                    monthlyPayment: 1250.00,
                    nextPaymentDate: '2024-12-01',
                    status: 'Active',
                    paymentHistory: [
                        { date: '2024-11-01', amount: 1250.00, principal: 890.00, interest: 360.00 },
                        { date: '2024-10-01', amount: 1250.00, principal: 885.00, interest: 365.00 }
                    ]
                },
                {
                    id: 3,
                    loanNumber: 'BL-2022-003',
                    lender: 'Small Business Fund',
                    purpose: 'Working Capital',
                    originalAmount: 25000.00,
                    currentBalance: 3200.00,
                    paidAmount: 21800.00,
                    interestRate: 4.8,
                    startDate: '2022-03-10',
                    endDate: '2025-03-10',
                    monthlyPayment: 750.00,
                    nextPaymentDate: '2024-12-10',
                    status: 'Active',
                    paymentHistory: [
                        { date: '2024-11-10', amount: 750.00, principal: 650.00, interest: 100.00 },
                        { date: '2024-10-10', amount: 750.00, principal: 645.00, interest: 105.00 }
                    ]
                },
                {
                    id: 4,
                    loanNumber: 'BL-2021-004',
                    lender: 'Regional Credit Union',
                    purpose: 'Office Renovation',
                    originalAmount: 15000.00,
                    currentBalance: 0.00,
                    paidAmount: 15000.00,
                    interestRate: 4.2,
                    startDate: '2021-08-15',
                    endDate: '2024-08-15',
                    monthlyPayment: 450.00,
                    nextPaymentDate: null,
                    status: 'Paid Off',
                    paymentHistory: [
                        { date: '2024-08-15', amount: 450.00, principal: 450.00, interest: 0.00 },
                        { date: '2024-07-15', amount: 450.00, principal: 435.00, interest: 15.00 }
                    ]
                }
            ];
            setLoans(mockLoans);
            setIsLoading(false);
        }, 800);
    }, []);

    // Filter loans based on search and status
    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.lender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || loan.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Calculate totals
    const totalOriginalAmount = loans.reduce((sum, loan) => sum + loan.originalAmount, 0);
    const totalCurrentBalance = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    const totalPaidAmount = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
    const totalMonthlyPayments = loans.filter(loan => loan.status === 'Active').reduce((sum, loan) => sum + loan.monthlyPayment, 0);

    // Get unique statuses for filter
    const statuses = ['all', ...new Set(loans.map(loan => loan.status))];

    // Calculate progress percentage
    const getProgressPercentage = (paidAmount, originalAmount) => {
        return (paidAmount / originalAmount) * 100;
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'paid off':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'overdue':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-fg-50">Loans Tracking</h2>
                    <p className="text-fg-60">Monitor loan payments, balances, and progress</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Add Loan
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Borrowed */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Total Borrowed</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalOriginalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-fg-60 mt-1">
                        Original loan amounts
                    </div>
                </div>

                {/* Current Balance */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Outstanding</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalCurrentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
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

                {/* Monthly Payments */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Monthly Payments</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalMonthlyPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-fg-60 mt-1">
                        Active loans only
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <input
                        type="text"
                        placeholder="Search loans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                    />
                </div>
                
                <div className="relative">
                    <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent appearance-none"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All Status' : status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loans List */}
            <div className="space-y-4">
                {filteredLoans.map((loan) => {
                    const progressPercentage = getProgressPercentage(loan.paidAmount, loan.originalAmount);
                    const remainingPercentage = 100 - progressPercentage;
                    
                    return (
                        <div key={loan.id} className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                            <div className="p-6">
                                {/* Loan Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-fg-50">{loan.loanNumber}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-fg-60 mb-1">{loan.lender}</div>
                                        <div className="text-sm text-fg-60">{loan.purpose}</div>
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

                                {/* Loan Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Original Amount</div>
                                        <div className="text-lg font-semibold text-fg-50">
                                            ${loan.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Amount Paid</div>
                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            ${loan.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Remaining Balance</div>
                                        <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            ${loan.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Interest Rate</div>
                                        <div className="text-lg font-semibold text-fg-50">{loan.interestRate}%</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-fg-60">Payment Progress</span>
                                        <span className="text-sm font-medium text-fg-50">
                                            {progressPercentage.toFixed(1)}% Complete
                                        </span>
                                    </div>
                                    <div className="bg-bg-40 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-fg-60 mt-1">
                                        <span>Paid: ${loan.paidAmount.toLocaleString()}</span>
                                        <span>Remaining: ${loan.currentBalance.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-bd-50">
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Monthly Payment</div>
                                        <div className="text-sm font-medium text-fg-50">
                                            ${loan.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Next Payment</div>
                                        <div className="text-sm font-medium text-fg-50">
                                            {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Loan Term</div>
                                        <div className="text-sm font-medium text-fg-50">
                                            {new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
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
                            <div className="font-medium text-fg-50">Add Loan</div>
                            <div className="text-xs text-fg-60">Register new loan</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <DollarSign size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Make Payment</div>
                            <div className="text-xs text-fg-60">Record loan payment</div>
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
                        <Percent size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Interest Calculator</div>
                            <div className="text-xs text-fg-60">Calculate interest</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoansTracking;