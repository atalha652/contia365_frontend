// frontend/src/components/pages/projects/ProjectsHeader.jsx
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const ProjectsHeader = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }) => {
    const [showSearch, setShowSearch] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    return (
        <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-fg-60 hover:text-fg-50 transition-colors"
            >
                <Search size={18} />
            </button>

            {/* Search Input */}
            {showSearch && (
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-3 pr-8 py-1.5 border border-bd-50 rounded-md bg-bg-60 text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                        autoFocus
                    />
                    <button
                        onClick={() => setShowSearch(false)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-fg-60 hover:text-fg-50"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filter Icon */}
            <div className="relative">
                <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="p-2 text-fg-60 hover:text-fg-50 transition-colors"
                >
                    <Filter size={18} />
                </button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-60 rounded-md border border-bd-50 z-10">
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
        </div>
    );
};

export default ProjectsHeader; 