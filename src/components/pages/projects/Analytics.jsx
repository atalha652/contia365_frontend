// frontend/src/components/pages/projects/Analytics.jsx
import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    FolderOpen,
    FileText,
    DollarSign,
    TrendingUp
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
import { Line, Doughnut } from 'react-chartjs-2';

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

const Analytics = () => {
    const { projects = [], user = {} } = useOutletContext();

    // Calculate statistics
    const stats = useMemo(() => {
        const totalProjects = projects.length;
        const totalInvoices = projects.reduce((sum, project) => sum + (project.invoiceCount || 0), 0);
        const totalAmount = projects.reduce((sum, project) => sum + (project.totalAmount || 0), 0);
        const activeProjects = projects.filter(project => project.status === 'active').length;

        return {
            totalProjects,
            totalInvoices,
            totalAmount,
            activeProjects
        };
    }, [projects]);

    // Prepare data for charts
    const chartData = useMemo(() => {
        // Project activity over time (mock data for now)
        const projectActivity = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Projects',
                data: [2, 3, 1, 4, 2, 3],
                backgroundColor: 'rgba(10, 197, 168, 0.2)',
                borderColor: 'rgba(10, 197, 168, 1)',
                borderWidth: 2
            }]
        };

        // Invoice distribution by project
        const invoiceDistribution = {
            labels: projects.map(project => project.name),
            datasets: [{
                data: projects.map(project => project.invoiceCount || 0),
                backgroundColor: [
                    'rgba(10, 197, 168, 0.8)',
                    'rgba(2, 117, 112, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 0
            }]
        };

        return {
            projectActivity,
            invoiceDistribution
        };
    }, [projects]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mt-12">
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center justify-between p-6 bg-bg-60 rounded-lg border border-bd-50">
                    <div>
                        <p className="text-sm font-medium text-fg-60">Total Projects</p>
                        <p className="text-2xl font-bold text-fg-50">{stats.totalProjects}</p>
                    </div>
                    <FolderOpen size={24} className="text-ac-02" />
                </div>

                <div className="flex items-center justify-between p-6 bg-bg-60 rounded-lg border border-bd-50">
                    <div>
                        <p className="text-sm font-medium text-fg-60">Total Invoices</p>
                        <p className="text-2xl font-bold text-fg-50">{stats.totalInvoices}</p>
                    </div>
                    <FileText size={24} className="text-ac-02" />
                </div>

                <div className="flex items-center justify-between p-6 bg-bg-60 rounded-lg border border-bd-50">
                    <div>
                        <p className="text-sm font-medium text-fg-60">Total Amount</p>
                        <p className="text-2xl font-bold text-fg-50">${stats.totalAmount.toLocaleString()}</p>
                    </div>
                    <DollarSign size={24} className="text-ac-02" />
                </div>

                <div className="flex items-center justify-between p-6 bg-bg-60 rounded-lg border border-bd-50">
                    <div>
                        <p className="text-sm font-medium text-fg-60">Active Projects</p>
                        <p className="text-2xl font-bold text-fg-50">{stats.activeProjects}</p>
                    </div>
                    <TrendingUp size={24} className="text-ac-02" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Activity Chart */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50 mb-4">Project Activity</h3>
                    <div className="h-64">
                        <Line data={chartData.projectActivity} options={chartOptions} />
                    </div>
                </div>

                {/* Invoice Distribution Chart */}
                <div className="bg-bg-60 rounded-lg p-6 border border-bd-50">
                    <h3 className="text-lg font-semibold text-fg-50 mb-4">Invoice Distribution</h3>
                    <div className="h-64">
                        <Doughnut data={chartData.invoiceDistribution} options={doughnutOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics; 