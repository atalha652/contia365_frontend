// Dashboard component with mock data only + animations + gradient quadrants
import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { projects = [], user = {} } = useOutletContext();

    const [isLoading] = useState(false); // disable backend loading for mock-only version
    const [error] = useState(null);

    // Stats mock data
    const stats = useMemo(() => {
        const totalInvoices = projects.length;
        const successfulInvoices = projects.filter(
            invoice =>
                invoice.status === 'Done' ||
                invoice.status === 'Success' ||
                invoice.status === 'completed'
        ).length;
        const pendingInvoices = projects.filter(
            invoice =>
                invoice.status === 'pending' || invoice.status === 'inprogress'
        ).length;
        const failedInvoices = projects.filter(
            invoice => invoice.status === 'failed' || invoice.status === 'error'
        ).length;

        const successRate =
            totalInvoices > 0
                ? ((successfulInvoices / totalInvoices) * 100).toFixed(1)
                : 0;

        return {
            totalInvoices,
            successfulInvoices,
            pendingInvoices,
            failedInvoices,
            totalBillAmount: 50000,
            totalVATAmount: 12000,
            totalWithVAT: 62000,
            successRate
        };
    }, [projects]);

    // Mock chart data
    const chartData = useMemo(() => {
        const monthlyTaxTrend = {
            labels: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ],
            datasets: [
                {
                    label: 'Monthly VAT',
                    data: [1200, 1900, 3000, 5000, 2300, 3200, 4100, 3800, 4500, 3900, 4200, 5100],
                    borderColor: 'rgb(14, 165, 233)', // sky-500
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        const dailyTaxTrend = {
            labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
            datasets: [
                {
                    label: 'Daily VAT',
                    data: Array.from({ length: 30 }, (_, i) => {
                        const baseAmount = 150;
                        const variation = Math.sin(i * 0.2) * 50 + Math.random() * 30;
                        return Math.max(50, baseAmount + variation);
                    }),
                    borderColor: 'rgb(249, 115, 22)', // orange-500
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        return { monthlyTaxTrend, dailyTaxTrend };
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: "easeOutQuart",
            delay: (ctx) => ctx.dataIndex * 80  // each point animates one by one
        },
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };


    // Cards content
    const cards = [
        {
            label: 'Total Invoices',
            value: stats.totalInvoices,
            color: 'from-white to-purple-400 dark:from-gray-800 dark:to-purple-600',
            iconBg: 'bg-purple-600 dark:bg-purple-500',
            icon: <FileText size={20} className="text-white" />,
            sub: 'All time invoices'
        },
        {
            label: 'Successful Invoices',
            value: stats.successfulInvoices,
            color: 'from-white to-lime-400 dark:from-gray-800 dark:to-lime-600',
            iconBg: 'bg-green-600 dark:bg-green-500',
            icon: <CheckCircle size={20} className="text-white" />,
            sub: `Success rate: ${stats.successRate}%`
        },
        {
            label: 'Pending Invoices',
            value: stats.pendingInvoices,
            color: 'from-white to-orange-400 dark:from-gray-800 dark:to-orange-600',
            iconBg: 'bg-orange-600 dark:bg-orange-500',
            icon: <Clock size={20} className="text-white" />,
            sub: 'In progress work'
        },
        {
            label: 'Total Tax',
            value: `$${stats.totalVATAmount.toLocaleString()}`,
            color: 'from-white to-sky-400 dark:from-gray-800 dark:to-sky-600',
            iconBg: 'bg-blue-600 dark:bg-blue-500',
            icon: <DollarSign size={20} className="text-white" />,
            sub: 'VAT collected from invoices'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.15, ease: 'easeOut' }}
                        className={`relative p-6 rounded-2xl transition-all duration-300 bg-gradient-to-br ${card.color} hover:scale-105 hover:shadow-lg`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${card.iconBg}`}
                            >
                                {card.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {card.label}
                            </p>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-2"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {card.value}
                                </p>
                            )}
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {card.sub}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-fg-50 mr-2" />
                        <p className="text-fg-50">Error loading analytics data: {error}</p>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Tax Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
                    className="bg-bg-60 rounded-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-fg-50 mb-4">
                        Daily Tax Trend
                    </h3>
                    {isLoading ? (
                        <div className="h-64 bg-bd-50 animate-pulse rounded flex items-center justify-center">
                            <p className="text-fg-60">Loading chart data...</p>
                        </div>
                    ) : (
                        <div className="h-64">
                            <Line
                                key="daily-trend"
                                data={chartData.dailyTaxTrend}
                                options={chartOptions}
                            />
                        </div>
                    )}
                </motion.div>

                {/* Monthly Tax Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8, ease: 'easeOut' }}
                    className="bg-bg-60 rounded-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-fg-50 mb-4">
                        Monthly Tax Trend
                    </h3>
                    {isLoading ? (
                        <div className="h-64 bg-bd-50 animate-pulse rounded flex items-center justify-center">
                            <p className="text-fg-60">Loading chart data...</p>
                        </div>
                    ) : (
                        <div className="h-64">
                            <Line
                                key="monthly-trend"
                                data={chartData.monthlyTaxTrend}
                                options={chartOptions}
                            />
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
};

export default Dashboard;
