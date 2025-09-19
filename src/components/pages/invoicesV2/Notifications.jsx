// Component for managing notifications from AEAT, Social Security, DGT, and courthouse
import React, { useState, useEffect } from 'react';
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Building,
    Shield,
    Car,
    Scale,
    Filter,
    Search,
    MoreVertical,
    Eye,
    Archive,
    Trash2,
    ExternalLink
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockNotifications = [
                {
                    id: 1,
                    source: 'AEAT',
                    title: 'Quarterly VAT Declaration Due',
                    description: 'Q4 2024 VAT declaration must be submitted by December 31, 2024',
                    type: 'Tax Declaration',
                    priority: 'High',
                    status: 'Pending',
                    dueDate: '2024-12-31',
                    receivedDate: '2024-11-15',
                    referenceNumber: 'AEAT-VAT-Q4-2024',
                    actionRequired: true,
                    estimatedAmount: 8500.00
                },
                {
                    id: 2,
                    source: 'Social Security',
                    title: 'Monthly Contribution Payment',
                    description: 'November 2024 social security contributions are due',
                    type: 'Contribution',
                    priority: 'High',
                    status: 'Overdue',
                    dueDate: '2024-11-30',
                    receivedDate: '2024-11-01',
                    referenceNumber: 'SS-CONT-NOV-2024',
                    actionRequired: true,
                    estimatedAmount: 2850.00
                },
                {
                    id: 3,
                    source: 'DGT',
                    title: 'Vehicle Registration Renewal',
                    description: 'Company vehicle registration expires on January 15, 2025',
                    type: 'Registration',
                    priority: 'Medium',
                    status: 'Pending',
                    dueDate: '2025-01-15',
                    receivedDate: '2024-11-20',
                    referenceNumber: 'DGT-REG-2025-001',
                    actionRequired: true,
                    estimatedAmount: 450.00
                },
                {
                    id: 4,
                    source: 'Courthouse',
                    title: 'Contract Dispute Hearing',
                    description: 'Scheduled hearing for contract dispute case #CD-2024-089',
                    type: 'Legal Proceeding',
                    priority: 'High',
                    status: 'Scheduled',
                    dueDate: '2024-12-20',
                    receivedDate: '2024-11-10',
                    referenceNumber: 'COURT-CD-2024-089',
                    actionRequired: true,
                    estimatedAmount: null
                },
                {
                    id: 5,
                    source: 'AEAT',
                    title: 'Annual Income Tax Return',
                    description: 'Annual income tax return for fiscal year 2024 is due',
                    type: 'Tax Return',
                    priority: 'Medium',
                    status: 'Pending',
                    dueDate: '2025-06-30',
                    receivedDate: '2024-11-01',
                    referenceNumber: 'AEAT-ITR-2024',
                    actionRequired: false,
                    estimatedAmount: 15200.00
                },
                {
                    id: 6,
                    source: 'Social Security',
                    title: 'Employee Registration Confirmation',
                    description: 'New employee registration has been processed successfully',
                    type: 'Confirmation',
                    priority: 'Low',
                    status: 'Completed',
                    dueDate: null,
                    receivedDate: '2024-11-18',
                    referenceNumber: 'SS-EMP-REG-2024-045',
                    actionRequired: false,
                    estimatedAmount: null
                },
                {
                    id: 7,
                    source: 'DGT',
                    title: 'Traffic Fine Payment',
                    description: 'Outstanding traffic fine for company vehicle',
                    type: 'Fine',
                    priority: 'Medium',
                    status: 'Pending',
                    dueDate: '2024-12-15',
                    receivedDate: '2024-11-25',
                    referenceNumber: 'DGT-FINE-2024-156',
                    actionRequired: true,
                    estimatedAmount: 200.00
                }
            ];
            setNotifications(mockNotifications);
            setIsLoading(false);
        }, 800);
    }, []);

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notification.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSource = filterSource === 'all' || notification.source === filterSource;
        const matchesStatus = filterStatus === 'all' || notification.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesSource && matchesStatus;
    });

    // Get unique sources and statuses for filters
    const sources = ['all', ...new Set(notifications.map(n => n.source))];
    const statuses = ['all', ...new Set(notifications.map(n => n.status))];

    // Get source icon
    const getSourceIcon = (source) => {
        switch (source) {
            case 'AEAT':
                return <FileText size={20} className="text-blue-600 dark:text-blue-400" />;
            case 'Social Security':
                return <Shield size={20} className="text-green-600 dark:text-green-400" />;
            case 'DGT':
                return <Car size={20} className="text-orange-600 dark:text-orange-400" />;
            case 'Courthouse':
                return <Scale size={20} className="text-purple-600 dark:text-purple-400" />;
            default:
                return <Building size={20} className="text-gray-600 dark:text-gray-400" />;
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

    // Get status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'overdue':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'completed':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'scheduled':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
        }
    };

    // Calculate summary stats
    const pendingCount = notifications.filter(n => n.status === 'Pending').length;
    const overdueCount = notifications.filter(n => n.status === 'Overdue').length;
    const actionRequiredCount = notifications.filter(n => n.actionRequired).length;
    const totalEstimatedAmount = notifications
        .filter(n => n.estimatedAmount)
        .reduce((sum, n) => sum + n.estimatedAmount, 0);

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
                    <h2 className="text-2xl font-bold text-fg-50">Notifications</h2>
                    <p className="text-fg-60">Government and legal notifications from AEAT, Social Security, DGT, and courthouse</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors">
                    <Bell size={16} />
                    Mark All Read
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Pending Notifications */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{pendingCount}</div>
                    <div className="text-xs text-fg-60 mt-1">
                        Awaiting action
                    </div>
                </div>

                {/* Overdue Notifications */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Overdue</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{overdueCount}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Immediate attention
                    </div>
                </div>

                {/* Action Required */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Bell size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Action Required</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">{actionRequiredCount}</div>
                    <div className="text-xs text-fg-60 mt-1">
                        Need response
                    </div>
                </div>

                {/* Estimated Amount */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Est. Amount</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalEstimatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-fg-60 mt-1">
                        Total estimated
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                    />
                </div>
                
                <div className="relative">
                    <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent appearance-none"
                    >
                        {sources.map(source => (
                            <option key={source} value={source}>
                                {source === 'all' ? 'All Sources' : source}
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

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                        <div className="p-6">
                            {/* Notification Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 bg-bg-50 rounded-lg border border-bd-50">
                                        {getSourceIcon(notification.source)}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-fg-50">{notification.title}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                                {notification.priority}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                                {notification.status}
                                            </span>
                                            {notification.actionRequired && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                                    Action Required
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-fg-60 mb-2">{notification.description}</p>
                                        
                                        <div className="flex items-center gap-4 text-sm text-fg-60">
                                            <span>Source: {notification.source}</span>
                                            <span>•</span>
                                            <span>Ref: {notification.referenceNumber}</span>
                                            <span>•</span>
                                            <span>Received: {new Date(notification.receivedDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                        <Eye size={16} />
                                    </button>
                                    <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                        <ExternalLink size={16} />
                                    </button>
                                    <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                        <Archive size={16} />
                                    </button>
                                    <button className="p-2 text-fg-60 hover:text-red-500 hover:bg-bg-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    <button className="p-2 text-fg-60 hover:text-fg-50 hover:bg-bg-50 rounded-lg transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Notification Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-bd-50">
                                <div>
                                    <div className="text-xs text-fg-60 mb-1">Type</div>
                                    <div className="text-sm font-medium text-fg-50">{notification.type}</div>
                                </div>
                                
                                {notification.dueDate && (
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Due Date</div>
                                        <div className="text-sm font-medium text-fg-50">
                                            {new Date(notification.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                
                                {notification.estimatedAmount && (
                                    <div>
                                        <div className="text-xs text-fg-60 mb-1">Estimated Amount</div>
                                        <div className="text-sm font-medium text-fg-50">
                                            ${notification.estimatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {notification.actionRequired && (
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-bd-50">
                                    <button className="px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors text-sm">
                                        Take Action
                                    </button>
                                    <button className="px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors text-sm border border-bd-50">
                                        View Details
                                    </button>
                                    <button className="px-4 py-2 bg-bg-50 hover:bg-bg-40 text-fg-50 rounded-lg transition-colors text-sm border border-bd-50">
                                        Set Reminder
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <FileText size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">AEAT Portal</div>
                            <div className="text-xs text-fg-60">Access tax portal</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Shield size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Social Security</div>
                            <div className="text-xs text-fg-60">Check contributions</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Car size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">DGT Services</div>
                            <div className="text-xs text-fg-60">Vehicle services</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Scale size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Legal Calendar</div>
                            <div className="text-xs text-fg-60">Court schedules</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;