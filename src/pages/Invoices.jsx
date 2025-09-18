// frontend/src/pages/Invoices.jsx
import { useState, useEffect, useCallback } from "react";
import { updatePageTitle } from "../utils/titleUtils";
import { toast } from "react-toastify";
import { Outlet, useLocation } from "react-router-dom";
import {
    PanelLeftDashed,
    PanelLeft,
    Moon,
    Sun
} from "lucide-react";
import CreateInvoiceModal from "../components/pages/invoices/CreateInvoiceModal";
import Sidebar from "../components/pages/invoices/Sidebar";
import { createProject, getMyProjects } from "../api/apiFunction/projectServices";
import { useTheme } from "../context/ThemeContext";


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
        <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Table Header Skeleton */}
                <div className="bg-bg-60 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-bd-50">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="h-4 bg-bg-40 rounded w-20"></div>
                            <div className="h-4 bg-bg-40 rounded w-24"></div>
                            <div className="h-4 bg-bg-40 rounded w-16"></div>
                            <div className="h-4 bg-bg-40 rounded w-20"></div>
                            <div className="h-4 bg-bg-40 rounded w-16"></div>
                        </div>
                    </div>

                    {/* Table Rows Skeleton */}
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="px-6 py-4 border-b border-bd-50 last:border-b-0">
                            <div className="grid grid-cols-5 gap-4 items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-bg-40 rounded"></div>
                                    <div className="h-4 bg-bg-40 rounded w-24"></div>
                                </div>
                                <div className="h-4 bg-bg-40 rounded w-32"></div>
                                <div className="h-6 bg-bg-40 rounded w-16"></div>
                                <div className="h-4 bg-bg-40 rounded w-20"></div>
                                <div className="h-6 bg-bg-40 rounded w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const Invoices = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            // Extract userId from possible keys to support varied auth payloads
            const userId = user?.id || user?._id || user?.user_id || user?.uid;
            if (!userId) {
                throw new Error("Missing user id");
            }
            const response = await getMyProjects(userId);
            // Handle the new API response format with "projects" wrapper
            const projectsData = response?.projects || response || [];
            setProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to fetch projects");
            // Fallback to empty array
            setProjects([]);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, user?._id, user?.user_id, user?.uid]);

    useEffect(() => {
        fetchProjects();
        updatePageTitle('Invoices');
    }, [fetchProjects]);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const handleCreateProject = async (projectData) => {
        try {
            setIsLoading(true);
            const response = await createProject(projectData);

            if (response.status === 201 || response.status === 200) {
                toast.success("Invoice created successfully");
                setShowCreateProjectModal(false);
                // Refresh projects list
                await fetchProjects();
            } else {
                throw new Error(response.data?.message || "Failed to create project");
            }
        } catch (error) {
            console.error("Error creating project:", error);
            toast.error(error.message || "Failed to create project");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            // Refresh projects list after deletion
            console.log("Delete project:", projectId);
            await fetchProjects(); // Refresh the projects list
            toast.success("Project deleted successfully");
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Failed to delete project");
        }
    };

    const handleEditProject = async (projectData) => {
        try {
            // TODO: Implement edit functionality when API is available
            console.log("Edit project:", projectData);
            toast.info("Edit functionality will be implemented soon");
        } catch (error) {
            console.error("Error editing project:", error);
            toast.error("Failed to edit project");
        }
    };



    return (
        <div className="flex h-screen bg-bg-50 text-fg-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                sidebarExpanded={sidebarExpanded}
                isLoading={isLoading}
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
                                {location.pathname.split("/").pop() === "list"
                                    ? "Invoices"
                                    : location.pathname.split("/").pop() === "invoices" || location.pathname === "/invoices"
                                        ? "Dashboard"
                                        : "Dashboard"}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-fg-60 hover:text-fg-50 transition-colors rounded-md hover:bg-bg-50"
                                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                            >
                                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {isLoading ? (
                            <ContentSkeleton />
                        ) : (
                            <Outlet context={{
                                projects,
                                onDeleteProject: handleDeleteProject,
                                onEditProject: handleEditProject,
                                onCreateProject: () => setShowCreateProjectModal(true),
                                onRefreshProjects: fetchProjects
                            }} />
                        )}
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateProjectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-bg-60 rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Create New Invoice</h3>
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
                            <CreateInvoiceModal
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

export default Invoices;