// frontend/src/pages/Projects.jsx
import { useState, useEffect, useCallback } from "react";
import { updatePageTitle } from "../utils/titleUtils";
import { toast } from "react-toastify";
import { Outlet, useLocation } from "react-router-dom";
import {
    PanelLeft,
    PanelLeftDashed,
    FolderOpen,
    X,
    Plus,
} from "lucide-react";
import CreateProjectModal from "../components/pages/projects/CreateProjectModal";
import Sidebar from "../components/pages/projects/Sidebar";
import ProjectsHeader from "../components/pages/projects/ProjectsHeader";



const HeaderSkeleton = () => (
    <div className="animate-pulse">
        <div className="flex items-center justify-between px-6 py-3 border-b border-bd-50">
            <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-bg-40 rounded"></div>
                <div className="h-6 bg-bg-40 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-8 bg-bg-40 rounded w-16"></div>
                <div className="h-8 w-8 bg-bg-40 rounded-full"></div>
                <div className="h-8 w-8 bg-bg-40 rounded-full"></div>
            </div>
        </div>
    </div>
);

const ContentSkeleton = () => (
    <div className="animate-pulse p-6">
        <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
                <div className="h-8 bg-bg-40 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-bg-60 rounded-lg p-6">
                            <div className="h-4 bg-bg-40 rounded w-24 mb-4"></div>
                            <div className="h-8 bg-bg-40 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-bg-40 rounded w-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const Projects = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const location = useLocation();

    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            // TODO: Replace with actual API call
            // const response = await getProjects(user.id);
            // setProjects(Array.isArray(response) ? response : []);

            // Mock data for now
            const mockProjects = [
                {
                    id: 1,
                    name: "Monthly Expenses",
                    description: "Track all monthly business expenses",
                    invoiceCount: 45,
                    totalAmount: 12500,
                    createdAt: new Date(),
                    status: "active"
                },
                {
                    id: 2,
                    name: "Client Projects",
                    description: "Invoices from client projects",
                    invoiceCount: 23,
                    totalAmount: 8900,
                    createdAt: new Date(),
                    status: "active"
                },
                {
                    id: 3,
                    name: "Travel Expenses",
                    description: "Business travel and accommodation",
                    invoiceCount: 12,
                    totalAmount: 3400,
                    createdAt: new Date(),
                    status: "active"
                }
            ];
            setProjects(mockProjects);
            return true;
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to fetch projects");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchProjects();
        updatePageTitle('Projects');
    }, [fetchProjects]);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const handleCreateProject = async (projectData) => {
        try {
            setIsLoading(true);
            // TODO: Replace with actual API call
            // const response = await createProject(projectData);

            // Mock creation
            const newProject = {
                id: Date.now(),
                ...projectData,
                invoiceCount: 0,
                totalAmount: 0,
                createdAt: new Date(),
                status: "active"
            };

            setProjects(prev => [...prev, newProject]);
            toast.success("Project created successfully");
            setShowCreateProjectModal(false);
        } catch (error) {
            console.error("Error creating project:", error);
            toast.error("Failed to create project");
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="flex h-screen bg-bg-50 text-fg-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                sidebarExpanded={sidebarExpanded}
                isLoading={isLoading}
                user={user}
                PanelLeft={PanelLeft}
                FolderOpen={FolderOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                {isLoading ? (
                    <HeaderSkeleton />
                ) : (
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 text-fg-60 hover:text-fg-50 transition-colors"
                            >
                                {sidebarExpanded ? (
                                    <PanelLeftDashed size={20} />
                                ) : (
                                    <PanelLeft size={20} />
                                )}
                            </button>
                            <h1 className="text-lg font-semibold">
                                {location.pathname.split("/").pop() === "projects"
                                    ? "Manage Projects"
                                    : location.pathname.split("/").pop() === "analytics"
                                        ? "Analytics"
                                        : "Projects"}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Search and Filter Controls */}
                            <ProjectsHeader
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                            />

                            {/* Create Project Button */}
                            <button
                                onClick={() => setShowCreateProjectModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-md text-sm font-medium transition-colors"
                            >
                                <Plus size={16} />
                                New Project
                            </button>


                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <ContentSkeleton />
                        ) : (
                            <Outlet key={location.pathname} context={{ projects, user, searchQuery, statusFilter }} />
                        )}
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateProjectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-bg-60 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Create New Project</h3>
                            <button
                                onClick={() => {
                                    setShowCreateProjectModal(false);
                                }}
                                className="text-fg-60 hover:text-fg-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <CreateProjectModal
                                onSubmit={handleCreateProject}
                                onClose={() => setShowCreateProjectModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects; 