// frontend/src/components/pages/projects/ProjectsList.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
    FolderOpen,
    MoreHorizontal,
    Calendar,
    FileText
} from 'lucide-react';
import { formatDateTime } from '../../../utils/helperFunction';

const ProjectsList = () => {
    const { projects = [], searchQuery = '', statusFilter = 'all' } = useOutletContext();
    // menu: { id, top, left, placeAbove, triggerEl }
    const [menu, setMenu] = useState(null);
    const menuRef = useRef(null);

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

    const handleActionClick = (projectId, action) => {
        console.log(`Action ${action} for project ${projectId}`);
        setMenu(null);
        // TODO: Implement actions
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', text: 'Pending' },
            active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', text: 'Active' },
            completed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', text: 'Completed' },
            inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200', text: 'Inactive' },
            archived: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', text: 'Archived' }
        };

        const config = statusConfig[status] || statusConfig.inactive;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
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
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const MENU_WIDTH = 192; // w-48
                                                            const ESTIMATED_HEIGHT = 112; // approx height of 2-3 items
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
        </div>
    );
};

export default ProjectsList; 