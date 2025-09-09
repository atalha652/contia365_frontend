// frontend/src/components/pages/projects/CreateProjectModal.jsx
import { useState } from "react";
import { X, Upload, FileImage, Trash2 } from "lucide-react";

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
        files: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

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

        if (!formData.files.length) {
            alert("At least one image file is required");
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
        const files = Array.from(e.target.files);
        
        // Filter only image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length !== files.length) {
            alert("Please select only image files (JPG, PNG, GIF, etc.)");
        }

        if (imageFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...imageFiles]
            }));

            // Create preview URLs for new images
            const newPreviews = imageFiles.map(file => ({
                file,
                url: URL.createObjectURL(file),
                name: file.name
            }));

            setImagePreviews(prev => [...prev, ...newPreviews]);
        }

        // Clear the input to allow selecting the same files again
        e.target.value = '';
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));

        // Clean up preview URL and remove from previews
        const previewToRemove = imagePreviews[index];
        if (previewToRemove) {
            URL.revokeObjectURL(previewToRemove.url);
        }
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({
            ...prev,
            color: color
        }));
    };

    // Clean up preview URLs when component unmounts
    useState(() => {
        return () => {
            imagePreviews.forEach(preview => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, []);

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

            {/* Image Files */}
            <div>
                <label htmlFor="file" className="block text-sm font-medium text-fg-50 mb-2">
                    Image Files * ({formData.files.length} selected)
                </label>
                <div className="space-y-3">
                    {/* Upload Button */}
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            id="file"
                            name="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="file"
                            className="flex items-center gap-2 px-4 py-2 border border-bd-50 rounded-md bg-bg-50 text-fg-50 cursor-pointer hover:bg-bg-40 transition-colors"
                        >
                            <Upload size={16} />
                            Add Images
                        </label>
                        <span className="text-sm text-fg-60">
                            Select multiple image files (JPG, PNG, GIF, etc.)
                        </span>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-fg-50">Selected Images:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square rounded-md overflow-hidden border border-bd-50 bg-bg-40">
                                            <img
                                                src={preview.url}
                                                alt={preview.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove image"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                            {preview.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* File List (Alternative view for smaller screens) */}
                    {formData.files.length > 0 && (
                        <div className="md:hidden">
                            <h4 className="text-sm font-medium text-fg-50 mb-2">Files:</h4>
                            <div className="space-y-2">
                                {formData.files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border border-bd-50 rounded-md bg-bg-40">
                                        <div className="flex items-center gap-2">
                                            <FileImage size={16} className="text-fg-60" />
                                            <span className="text-sm text-fg-50 truncate">{file.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-600 p-1"
                                            title="Remove file"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    disabled={
                        isSubmitting ||
                        !formData.title.trim() ||
                        !formData.description.trim() ||
                        !formData.files.length
                    }
                    className="px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creating..." : `Create Project (${formData.files.length} images)`}
                </button>
            </div>
        </form>
    );
};

export default CreateProjectModal;