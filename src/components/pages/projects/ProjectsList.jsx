// frontend/src/components/pages/projects/ProjectsList.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
    FolderOpen,
    MoreHorizontal,
    Download,
    Calendar,
    FileText,
    Eye,
    ScanLine,
    Loader2
} from 'lucide-react';
import { formatDateTime } from '../../../utils/helperFunction';
import { deleteProject, runOCR } from '../../../api/apiFunction/projectServices';
// import OCRModal from "./OCRModal";
import { toast } from 'react-toastify';
import ProjectImageModal from './ProjectImageModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ProjectsList = () => {
    const { projects = [], searchQuery = '', statusFilter = 'all', refreshProjects } = useOutletContext();
    // menu: { id, top, left, placeAbove, triggerEl }
    const [menu, setMenu] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('Preview');
    const [deletingProject, setDeletingProject] = useState(null);
    const menuRef = useRef(null);
    const [ocrModalOpen, setOcrModalOpen] = useState(false);
    const [ocrText, setOcrText] = useState("");
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrPdfUrl, setOcrPdfUrl] = useState(null);
    const [ocrStates, setOcrStates] = useState({});


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
    const handleDownloadPdf = (pdfUrl) => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "ocr_result.pdf";
        link.click();
    };


    // Custom Folder SVG Component
    const FolderIcon = ({ color = '#0ac5a8', size = 32 }) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3 7C3 5.89543 3.89543 5 5 5H8.5L10.5 3H19C20.1046 3 21 3.89543 21 5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                fill={color}
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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

    const handleDeleteClick = (projectId) => {
        setDeletingProject(projectId);
        setMenu(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingProject) return;

        try {
            const res = await deleteProject(deletingProject);
            if (res?.status === 200) {
                toast.success('Project deleted successfully');
            } else {
                toast.success('Project deletion requested');
            }
            if (typeof refreshProjects === 'function') {
                await refreshProjects();
            }
        } catch (e) {
            console.error('Delete project failed:', e);
            toast.error('Failed to delete project');
        } finally {
            setDeletingProject(null);
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

    const handleOcrClick = async (projectId) => {
        // mark as processing
        setOcrStates((prev) => ({
            ...prev,
            [projectId]: { loading: true, pdfUrl: null }
        }));

        try {
            const userDataString = localStorage.getItem("user");
            const user = JSON.parse(userDataString || "{}");
            if (!user?.user_id) throw new Error("User not found");

            const data = await runOCR({ user_id: user.user_id, project_id: projectId });

            if (data?.results?.length > 0) {
                const firstResult = data.results[0];
                setOcrStates((prev) => ({
                    ...prev,
                    [projectId]: {
                        loading: false,
                        pdfUrl: firstResult.result_url || null
                    }
                }));
            } else {
                toast.error("No OCR results returned");
                setOcrStates((prev) => ({
                    ...prev,
                    [projectId]: { loading: false, pdfUrl: null }
                }));
            }
        } catch (err) {
            console.error("OCR error:", err);
            toast.error("OCR processing failed");
            setOcrStates((prev) => ({
                ...prev,
                [projectId]: { loading: false, pdfUrl: null }
            }));
        }
    };




    return (
        <div className="space-y-6">
            {/* Projects Table */}
            <div className="mt-8">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderOpen size={48} className="text-fg-60 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-fg-50 mb-2">No projects found</h3>
                        <p className="text-fg-60">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first project to get started'
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
                                            Project
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
                                                        <FolderIcon
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
                                                {getStatusBadge(project.status)}
                                            </td>

                                            {/* Created Date */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-fg-50 flex items-center">
                                                    <Calendar size={14} className="mr-2" />
                                                    {project.created_at ? formatDateTime(project.created_at) : 'N/A'}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="relative inline-flex items-center gap-2">
                                                    {/* OCR / Processing / Download */}
                                                    {ocrStates[project._id]?.loading ? (
                                                        <Loader2 size={16} className="animate-spin text-blue-500" title="Processing..." />
                                                    ) : ocrStates[project._id]?.pdfUrl ? (
                                                        <button
                                                            onClick={() => handleDownloadPdf(ocrStates[project._id].pdfUrl)}
                                                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                                            title="Download OCR PDF"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOcrClick(project._id)}
                                                            className="p-1 text-fg-60 hover:text-fg-50 transition-colors"
                                                            title="Run OCR"
                                                        >
                                                            <ScanLine size={16} />
                                                        </button>
                                                    )}

                                                    {/* Existing Preview button */}
                                                    <button
                                                        onClick={() => {
                                                            if (project?.package_url) {
                                                                setPreviewUrl(project.package_url);
                                                                setPreviewTitle(project.title || project.name || 'Preview');
                                                            } else {
                                                                toast.info('No preview available for this project');
                                                            }
                                                        }}
                                                        className="p-1 text-fg-60 hover:text-fg-50 transition-colors"
                                                        title="Preview"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {/* Existing More actions */}
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
                                                        <MoreHorizontal size={16} />
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
                <ProjectImageModal
                    imageUrl={previewUrl}
                    title={previewTitle}
                    onClose={() => setPreviewUrl(null)}
                />
            )}
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                onConfirm={handleDeleteConfirm}
                itemName="this project"
            />

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
                                Edit Project
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

export default ProjectsList; 