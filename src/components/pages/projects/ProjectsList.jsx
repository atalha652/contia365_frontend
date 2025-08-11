// frontend/src/components/pages/projects/ProjectsList.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    FolderOpen,
    MoreHorizontal
} from 'lucide-react';
import { formatDateTime } from '../../../utils/helperFunction';

const ProjectsList = () => {
    const { projects = [], user = {}, searchQuery = '', statusFilter = 'all' } = useOutletContext();
    const [showActions, setShowActions] = useState(null);

    // Custom Folder SVG Component
    const FolderIcon = ({ color = '#0ac5a8', size = 64 }) => (
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
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleActionClick = (projectId, action) => {
        console.log(`Action ${action} for project ${projectId}`);
        setShowActions(null);
        // TODO: Implement actions
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', text: 'Active' },
            inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200', text: 'Inactive' },
            archived: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', text: 'Archived' }
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
            {/* Projects Grid */}
            <div className="mt-12">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="group relative p-6 cursor-pointer flex flex-col items-center"
                            >
                                {/* Custom Folder Icon */}
                                <div className="mb-3">
                                    <FolderIcon
                                        color={project.color || '#0ac5a8'}
                                        size={72}
                                    />
                                </div>

                                {/* Project Name Only */}
                                <div className="text-center">
                                    <h3 className="font-medium text-fg-50 text-sm truncate w-full">
                                        {project.name}
                                    </h3>
                                </div>

                                {/* Three Dots on Hover */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 text-fg-60 hover:text-fg-50 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsList; 