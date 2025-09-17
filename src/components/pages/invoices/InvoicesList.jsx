// frontend/src/components/pages/invoices/InvoicesList.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
    FolderOpen,
    Download,
    Calendar,
    Eye,
    Loader2,
    Search,
    Filter,
    Plus,
    X,
    Menu
} from 'lucide-react';
import { formatDateTime } from '../../../utils/helperFunction';
import { deleteProject, runOCR, getOCRResults } from '../../../api/apiFunction/projectServices';
// import OCRModal from "./OCRModal";
import { toast } from 'react-toastify';
import InvoiceImageModal from './InvoiceImageModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import OCRResultsModal from './OCRResultsModal';

const InvoicesList = () => {
    // Get data from outlet context instead of props
    const { projects = [], onDeleteProject, onEditProject, onCreateProject, onRefreshProjects } = useOutletContext();

    // Local state for search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showSearch, setShowSearch] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    // Note: refreshProjects functionality will be handled by parent component
    // menu: { id, top, left, placeAbove, triggerEl }
    const [menu, setMenu] = useState(null);
    const menuRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [deletingInvoice, setDeletingInvoice] = useState(null);
    const [localStatuses, setLocalStatuses] = useState({});
    const [ocrStates, setOcrStates] = useState({});
    const [pollInterval, setPollInterval] = useState(null);
    const [showOCRModal, setShowOCRModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [ocrDataByInvoice, setOcrDataByInvoice] = useState({});
    console.log("ocrDataByInvoice", ocrDataByInvoice);


    // Close actions dropdown when clicking outside (portal-aware)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!menu) return;
            const target = event.target;
            const insideMenu = menuRef.current && menuRef.current.contains(target);
            const onTrigger = menu.triggerEl && (menu.triggerEl === target || menu.triggerEl.contains(target));
            if (!insideMenu && !onTrigger) {
                setMenu(null);
            }
        };

        const handleResize = () => setMenu(null);
        const handleScroll = () => setMenu(null);

        if (menu) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [menu]);

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
                setShowFilterDropdown(false);
            }
        };

        if (showFilterDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showFilterDropdown]);


    const handleDownloadPdf = (pdfUrl) => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "ocr_result.pdf";
        link.click();
    };


    // Custom File SVG Component
    const FileIcon = ({ color = '#0ac5a8', size = 32 }) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill={color}
                d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.41l-4.83-4.83c-.37-.38-.88-.59-1.41-.59zm7 6V3.5L18.5 9H14c-.55 0-1-.45-1-1"
            />
        </svg>
    );

    // Filter projects based on search and status
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Auto-refresh when there are inprogress projects
    useEffect(() => {
        const hasInProgress = projects.some(p => p.status?.toLowerCase() === 'inprogress');

        if (hasInProgress) {
            const interval = setInterval(async () => {
                // Polling will be handled by parent component
                console.log('Projects with in-progress status detected, parent should handle polling');
            }, pollInterval || 5000);

            return () => clearInterval(interval);
        }
    }, [projects, pollInterval]);



    const handleDeleteClick = (projectId) => {
        setDeletingInvoice(projectId);
        setMenu(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingInvoice) return;

        try {
            const res = await deleteProject(deletingInvoice);
            if (res?.status === 200) {
                toast.success('Project deleted successfully');
            } else {
                toast.success('Project deletion requested');
            }
            if (typeof onDeleteProject === 'function') {
                onDeleteProject(deletingInvoice);
            }
        } catch (e) {
            console.error('Delete project failed:', e);
            toast.error('Failed to delete project');
        } finally {
            setDeletingInvoice(null);
        }
    };

    const handleActionClick = (projectId, action) => {
        if (action === 'delete') {
            handleDeleteClick(projectId);
            return;
        }
        // Placeholder for other actions (e.g., edit)
        console.log(`Action ${action} for project ${projectId}`);
        setMenu(null);
    };

    const getStatusBadge = (status) => {
        if (!status) return null;

        // Normalize API status (e.g., "Success" -> "success")
        const normalized = status.toLowerCase();

        const statusConfig = {
            pending: {
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
                text: "Pending",
            },
            inprogress: {
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
                text: "In Progress",
            },
            done: {
                color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
                text: "Done",
            },
            success: {
                color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
                text: "Success",
            },
            failed: {
                color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
                text: "Failed",
            },
            processing: {
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
                text: "Processing",
            },
        };

        const config = statusConfig[normalized] || {
            color: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200",
            text: status, // fallback to show raw API value
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const handleViewOCRResults = async (project) => {
        if (ocrStates[project._id]?.loading) return;

        setSelectedInvoice(project);
        setOcrStates(prev => ({ ...prev, [project._id]: { loading: true } }));

        try {
            const userDataString = localStorage.getItem("user");
            const user = JSON.parse(userDataString || "{}");
            const ocrData = await getOCRResults(project._id, user?.user_id);
            setOcrDataByInvoice(prev => ({ ...prev, [project._id]: ocrData }));
            setShowOCRModal(true);
        } catch (error) {
            console.error('Error fetching OCR data:', error);
            toast.error('Failed to fetch OCR results');
        } finally {
            setOcrStates(prev => ({ ...prev, [project._id]: { loading: false } }));
        }
    };

    const handleOcrClick = async (projectId) => {
        if (ocrStates[projectId]?.loading) return;

        // Immediately update status to inprogress
        setLocalStatuses(prev => ({ ...prev, [projectId]: 'inprogress' }));
        setOcrStates((prev) => ({
            ...prev,
            [projectId]: { loading: true, pdfUrl: null }
        }));

        try {
            const userDataString = localStorage.getItem("user");
            const user = JSON.parse(userDataString || "{}");
            if (!user?.user_id) throw new Error("User not found");

            const data = await runOCR({ user_id: user.user_id, project_id: projectId });
            console.log("data", data);
            toast.success("OCR processing started");

            // Store OCR data for later use
            if (data?.results) {
                setOcrDataByInvoice(prev => ({ ...prev, [projectId]: data }));
                localStorage.setItem(`ocr_data_${projectId}`, JSON.stringify(data));
            }

            // Initial refresh after 2 seconds
            setTimeout(async () => {
                // Set OCR as completed and stop loading
                setOcrStates((prev) => ({
                    ...prev,
                    [projectId]: { loading: false, completed: true, pdfUrl: null }
                }));
                // Clear local status override
                setLocalStatuses(prev => {
                    const newStatuses = { ...prev };
                    delete newStatuses[projectId];
                    return newStatuses;
                });
                // Refresh projects to update status badge instantly
                if (onRefreshProjects) {
                    await onRefreshProjects();
                }
            }, 2000);

        } catch (err) {
            console.error("OCR error:", err);
            toast.error("OCR processing failed");
            setOcrStates((prev) => ({
                ...prev,
                [projectId]: { loading: false, pdfUrl: null }
            }));
            // Clear local status on error
            setLocalStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[projectId];
                return newStatuses;
            });
        }
    };




    return (
        <div className="space-y-6">
            {/* Search, Filter, and Actions Bar */}
            <div className="flex w-full items-end gap-3 mb-6">
                {/* Search Field */}
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="search" className="block text-xs font-medium text-fg-60 mb-1">
                        Search Invoices
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-fg-60" />
                        </div>
                        <input
                            id="search"
                            type="text"
                            className="w-full pl-10 pr-10 py-2 text-xs border border-bd-50 rounded-md bg-bg-60 text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-1 focus:ring-ac-02 focus:border-ac-02"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <X size={16} className="text-fg-60 hover:text-fg-50" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <label className="block text-xs font-medium text-fg-60 mb-1">
                        Filter
                    </label>
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center gap-2 h-[32px] px-3 py-2 text-xs border border-bd-50 rounded-md bg-bg-60 text-fg-50 hover:bg-bg-50 focus:outline-none focus:ring-1 focus:ring-ac-02 focus:border-ac-02 transition-colors"
                    >
                        <Filter size={16} />
                        <span>{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                    </button>

                    {/* Filter Dropdown Menu */}
                    {showFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-bg-60 rounded-md border border-bd-50 shadow-lg z-10">
                            <div className="py-1">
                                <div className="px-3 py-2 border-b border-bd-50">
                                    <label className="text-xs font-medium text-fg-60 uppercase tracking-wider">
                                        Status
                                    </label>
                                </div>
                                <button
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setShowFilterDropdown(false);
                                    }}
                                    className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${statusFilter === 'all'
                                        ? 'bg-ac-02 text-white'
                                        : 'text-fg-60 hover:bg-bg-50'
                                        }`}
                                >
                                    All Status
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('active');
                                        setShowFilterDropdown(false);
                                    }}
                                    className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${statusFilter === 'active'
                                        ? 'bg-ac-02 text-white'
                                        : 'text-fg-60 hover:bg-bg-50'
                                        }`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('inactive');
                                        setShowFilterDropdown(false);
                                    }}
                                    className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${statusFilter === 'inactive'
                                        ? 'bg-ac-02 text-white'
                                        : 'text-fg-60 hover:bg-bg-50'
                                        }`}
                                >
                                    Inactive
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('archived');
                                        setShowFilterDropdown(false);
                                    }}
                                    className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${statusFilter === 'archived'
                                        ? 'bg-ac-02 text-white'
                                        : 'text-fg-60 hover:bg-bg-50'
                                        }`}
                                >
                                    Archived
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* New Invoice Button */}
                <div className="flex items-end">
                    <button
                        onClick={() => onCreateProject && onCreateProject()}
                        className="flex items-center gap-2 h-[32px] px-3 py-2 text-xs bg-ac-02 hover:bg-ac-01 rounded-md transition-colors shadow-sm text-white"
                    >
                        <Plus size={16} />
                        <span>New Invoice</span>
                    </button>
                </div>
            </div>

            {/* Projects Table */}
            <div className="mt-8">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderOpen size={48} className="text-fg-60 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-fg-50 mb-2">No invoices found</h3>
                        <p className="text-fg-60">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first invoice to get started'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="bg-bg-60 rounded-lg border border-bd-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-bg-40 border-b border-bd-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                            Invoice
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-fg-60 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-bd-50">
                                    {filteredProjects.map((project) => (
                                        <tr key={project._id} className="hover:bg-bg-50 transition-colors">
                                            {/* Project Icon and Title */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 mr-3">
                                                        <FileIcon
                                                            color={project.color || '#0ac5a8'}
                                                            size={32}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div
                                                            className="text-sm font-medium text-fg-50 truncate max-w-[16rem]"
                                                            title={(project.title || project.name) || ''}
                                                        >
                                                            {project.title || project.name}
                                                        </div>
                                                        {project.filename && (
                                                            <div className="text-xs text-fg-60 flex items-center gap-1 min-w-0 max-w-[16rem]">
                                                                <FileText size={12} className="flex-none" />
                                                                <span className="truncate" title={project.filename}>
                                                                    {project.filename}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4">
                                                <div
                                                    className="text-sm text-fg-50 truncate max-w-[24rem]"
                                                    title={project.description || 'No description'}
                                                >
                                                    {project.description || 'No description'}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(localStatuses[project._id] || project.status)}
                                            </td>


                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-fg-50 flex items-center">
                                                    <Calendar size={14} className="mr-2" />
                                                    {project.created_at ? formatDateTime(project.created_at) : 'N/A'}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="relative inline-flex items-center gap-2 justify-end">
                                                    {/* OCR Button - Run OCR or Results */}
                                                    {ocrStates[project._id]?.loading ? (
                                                        <button
                                                            disabled
                                                            className="flex items-center gap-1 h-[32px] px-3 py-2 text-xs bg-blue-100 text-blue-600 rounded-md cursor-not-allowed"
                                                        >
                                                            <Loader2 size={14} className="animate-spin" />
                                                            <span>Processing...</span>
                                                        </button>
                                                    ) : (ocrStates[project._id]?.completed || project.status?.toLowerCase() === 'done') ? (
                                                        <button
                                                            onClick={() => handleViewOCRResults(project)}
                                                            className="flex items-center gap-1 h-[32px] px-3 py-2 text-xs bg-bg-40 text-fg-60 hover:bg-bg-30 hover:text-fg-50 rounded-md transition-colors"
                                                        >
                                                            <span>Results</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOcrClick(project._id)}
                                                            className="flex items-center gap-1 h-[32px] px-3 py-2 text-xs bg-ac-02 hover:bg-ac-01 rounded-md transition-colors shadow-sm text-white"
                                                        >
                                                            <span>Run OCR</span>
                                                        </button>
                                                    )}

                                                    {/* Menu Icon for Dropdown */}
                                                    <button
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const MENU_WIDTH = 192;
                                                            const ESTIMATED_HEIGHT = 112;
                                                            const spaceBelow = window.innerHeight - rect.bottom;
                                                            const placeAbove = spaceBelow < ESTIMATED_HEIGHT + 16;
                                                            const top = placeAbove ? rect.top - 8 : rect.bottom + 8;
                                                            const left = Math.min(
                                                                Math.max(rect.right - MENU_WIDTH, 8),
                                                                window.innerWidth - MENU_WIDTH - 8
                                                            );
                                                            setMenu({ id: project._id, top, left, placeAbove, triggerEl: e.currentTarget });
                                                        }}
                                                        className="p-1 text-fg-60 hover:text-fg-50 transition-colors"
                                                        title="More actions"
                                                    >
                                                        <Menu size={16} />
                                                    </button>
                                                </div>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {/* Image Preview Modal */}
            {previewUrl && (
                <InvoiceImageModal
                    imageUrl={previewUrl}
                    title={previewTitle}
                    onClose={() => setPreviewUrl(null)}
                />
            )}
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deletingInvoice}
                onClose={() => setDeletingInvoice(null)}
                onConfirm={handleDeleteConfirm}
                itemName="this project"
            />

            {/* OCR Results Modal - Rendered at document body level */}
            {showOCRModal && ReactDOM.createPortal(
                <OCRResultsModal
                    isOpen={showOCRModal}
                    onClose={() => {
                        setShowOCRModal(false);
                        setSelectedInvoice(null);
                    }}
                    project={selectedInvoice}
                    ocrData={selectedInvoice ? (ocrDataByInvoice[selectedInvoice._id] || JSON.parse(localStorage.getItem(`ocr_data_${selectedInvoice._id}`) || 'null')) : null}
                />,
                document.body
            )}

            {/* Portal for Actions Menu */}
            {menu && ReactDOM.createPortal(
                <div
                    ref={menuRef}
                    style={{ position: 'fixed', top: menu.top, left: menu.left, width: 192 }}
                    className="z-50"
                >
                    <div className="bg-bg-60 rounded-md border border-bd-50 shadow-lg">
                        <div className="py-1">
                            <button
                                onClick={() => handleActionClick(menu.id, 'edit')}
                                className="flex items-center w-full px-4 py-2 text-sm text-fg-60 hover:bg-bg-50 transition-colors"
                            >
                                Edit Invoice
                            </button>
                            {/* Archive removed as requested */}
                            <button
                                onClick={() => handleActionClick(menu.id, 'delete')}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* <OCRModal
                isOpen={ocrModalOpen}
                onClose={() => setOcrModalOpen(false)}
                ocrText={ocrText}
                pdfUrl={ocrPdfUrl}
                loading={ocrLoading}
            /> */}



        </div>
    );
};

export default InvoicesList;