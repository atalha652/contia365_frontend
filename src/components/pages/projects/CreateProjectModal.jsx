// frontend/src/components/pages/projects/CreateProjectModal.jsx
import { useState } from "react";
import { X, Upload } from "lucide-react";

const DEFAULT_COLORS = [
    "#da4252",
    "#0099FF",
    "#5856D6",
    "#FD632F",
    "#00C24F",
    "#FFFFFF",
    "#1d1d1f",
];

const CreateProjectModal = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        color: "#0ac5a8", // Default to brand color
        file: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Project title is required");
            return;
        }

        if (!formData.description.trim()) {
            alert("Project description is required");
            return;
        }

        if (!formData.file) {
            alert("Project file is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                file: file
            }));
            setFileName(file.name);
        }
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({
            ...prev,
            color: color
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-fg-50 mb-2">
                    Project Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Monthly Expenses, Client Projects"
                    className="w-full px-3 py-2 border border-bd-50 rounded-md bg-bg-50 text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                    required
                />
            </div>

            {/* Project Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-fg-50 mb-2">
                    Description *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this project is for..."
                    rows={3}
                    className="w-full px-3 py-2 border border-bd-50 rounded-md bg-bg-50 text-fg-50 placeholder-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent resize-none"
                    required
                />
            </div>

            {/* Project Color */}
            <div>
                <label htmlFor="color" className="block text-sm font-medium text-fg-50 mb-2">
                    Project Color
                </label>
                <div className="space-y-3">
                    {/* Predefined Colors */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                            {DEFAULT_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleColorSelect(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color
                                        ? 'border-fg-50 scale-110'
                                        : 'border-bd-50 hover:border-fg-40'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="w-12 h-10 border border-bd-50 rounded-md bg-bg-50 cursor-pointer"
                        />
                        <span className="text-sm text-fg-60">
                            Or choose a custom color
                        </span>
                    </div>
                </div>
            </div>

            {/* Project File */}
            <div>
                <label htmlFor="file" className="block text-sm font-medium text-fg-50 mb-2">
                    Project File *
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                        />
                        <label
                            htmlFor="file"
                            className="flex items-center gap-2 px-4 py-2 border border-bd-50 rounded-md bg-bg-50 text-fg-50 cursor-pointer hover:bg-bg-40 transition-colors"
                        >
                            <Upload size={16} />
                            Choose File
                        </label>
                        <span className="text-sm text-fg-60">
                            {fileName || "No file chosen"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-fg-60 hover:text-fg-50 transition-colors"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.file}
                    className="px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creating..." : "Create Project"}
                </button>
            </div>
        </form>
    );
};

export default CreateProjectModal; 