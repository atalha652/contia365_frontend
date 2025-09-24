// Component for tracking investment goods and assets
import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Package,
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
    BarChart3
} from 'lucide-react';

const InvestmentGoods = () => {
    const [investments, setInvestments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const mockInvestments = [
                {
                    id: 1,
                    name: 'Office Equipment - Computers',
                    category: 'Equipment',
                    purchaseDate: '2024-01-15',
                    purchasePrice: 15000.00,
                    currentValue: 12500.00,
                    depreciationRate: 20,
                    usefulLife: 5,
                    status: 'Active',
                    description: 'Dell workstations for development team'
                },
                {
                    id: 2,
                    name: 'Company Vehicle - Ford Transit',
                    category: 'Vehicle',
                    purchaseDate: '2023-08-20',
                    purchasePrice: 35000.00,
                    currentValue: 28000.00,
                    depreciationRate: 15,
                    usefulLife: 8,
                    status: 'Active',
                    description: 'Delivery van for business operations'
                },
                {
                    id: 3,
                    name: 'Manufacturing Equipment',
                    category: 'Machinery',
                    purchaseDate: '2023-03-10',
                    purchasePrice: 85000.00,
                    currentValue: 68000.00,
                    depreciationRate: 25,
                    usefulLife: 10,
                    status: 'Active',
                    description: 'CNC machine for production line'
                },
                {
                    id: 4,
                    name: 'Office Furniture Set',
                    category: 'Furniture',
                    purchaseDate: '2024-02-01',
                    purchasePrice: 8500.00,
                    currentValue: 7650.00,
                    depreciationRate: 10,
                    usefulLife: 7,
                    status: 'Active',
                    description: 'Ergonomic desks and chairs for office'
                },
                {
                    id: 5,
                    name: 'Software Licenses',
                    category: 'Software',
                    purchaseDate: '2024-01-01',
                    purchasePrice: 12000.00,
                    currentValue: 9000.00,
                    depreciationRate: 33,
                    usefulLife: 3,
                    status: 'Active',
                    description: 'Annual software licenses and subscriptions'
                }
            ];
            setInvestments(mockInvestments);
            setIsLoading(false);
        }, 800);
    }, []);

    // Filter investments based on search and category
    const filteredInvestments = investments.filter(investment => {
        const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            investment.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || investment.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Calculate total investment value
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalPurchaseValue = investments.reduce((sum, inv) => sum + inv.purchasePrice, 0);
    const totalDepreciation = totalPurchaseValue - totalInvestmentValue;

    // Get unique categories for filter
    const categories = ['all', ...new Set(investments.map(inv => inv.category))];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-bg-40 rounded w-64 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[...Array(3)].map((_, i) => (
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
                    <h2 className="text-2xl font-bold text-fg-50">Investment Goods</h2>
                    <p className="text-fg-60">Track and manage your business assets and investments</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Add Investment
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Current Value */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Current Value</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalInvestmentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-fg-60 mt-1">
                        Total asset value
                    </div>
                </div>

                {/* Total Purchase Value */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Package size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Purchase Value</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalPurchaseValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-fg-60 mt-1">
                        Original investment
                    </div>
                </div>

                {/* Total Depreciation */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <TrendingUp size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-fg-60">Depreciation</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-50">
                        ${totalDepreciation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {((totalDepreciation / totalPurchaseValue) * 100).toFixed(1)}% depreciated
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <input
                        type="text"
                        placeholder="Search investments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                    />
                </div>
                
                <div className="relative">
                    <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fg-60" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-bg-50 border border-bd-50 rounded-lg text-fg-50 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent appearance-none"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Investments List */}
            <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50">Investment Assets</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-bg-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Asset</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Purchase Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Purchase Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Current Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Depreciation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bd-50">
                            {filteredInvestments.map((investment) => {
                                const depreciationAmount = investment.purchasePrice - investment.currentValue;
                                const depreciationPercent = (depreciationAmount / investment.purchasePrice) * 100;
                                
                                return (
                                    <tr key={investment.id} className="hover:bg-bg-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-fg-50">{investment.name}</div>
                                                <div className="text-sm text-fg-60">{investment.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ac-02 bg-opacity-10 text-ac-02">
                                                {investment.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-fg-60">
                                            {new Date(investment.purchaseDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-fg-50">
                                            ${investment.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-fg-50">
                                            ${investment.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-fg-50">
                                                ${depreciationAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-orange-600 dark:text-orange-400">
                                                {depreciationPercent.toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                investment.status === 'Active' 
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                                            }`}>
                                                {investment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-1 text-fg-60 hover:text-red-500 hover:bg-bg-40 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                <h3 className="text-lg font-semibold text-fg-50 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Plus size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Add Asset</div>
                            <div className="text-xs text-fg-60">Register new investment</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <BarChart3 size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Depreciation Report</div>
                            <div className="text-xs text-fg-60">Generate tax report</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Calendar size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Schedule Review</div>
                            <div className="text-xs text-fg-60">Asset valuation review</div>
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 bg-bg-50 hover:bg-bg-40 rounded-lg transition-colors text-left">
                        <Percent size={20} className="text-ac-02" />
                        <div>
                            <div className="font-medium text-fg-50">Tax Calculator</div>
                            <div className="text-xs text-fg-60">Calculate deductions</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvestmentGoods;