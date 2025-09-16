// frontend/src/api/apiFunction/projectServices.js
import { PROJECT_URL, OCR_URL } from "../restEndpoint";
import { httpPost, httpGet, httpDelete } from "../../utils/httpMethods";

export const createProject = async (data) => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();

    // Add required fields
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.color) formData.append('color', data.color);


    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("files", file); // ✅ append each file
      });
    }

    const response = await httpPost({
      url: PROJECT_URL + '/create',
      payload: formData
    });
    return response;
  } catch (err) {
    console.error('Create project error:', err);
    throw err;
  }
};

export const getMyProjects = async (userId) => {
  try {
    if (!userId) throw new Error('Missing userId for fetching projects');
    const response = await httpGet({
      url: `${PROJECT_URL}/${userId}`
    });
    // Keep the same return shape used by callers
    return response?.data || [];
  } catch (err) {
    console.error('Get projects error:', err);
    throw err;
  }
};

export const deleteProject = async (projectId) => {
  try {
    if (!projectId) throw new Error('Missing projectId for deletion');
    const response = await httpDelete({
      url: `${PROJECT_URL}/delete/${projectId}`,
    });
    return response;
  } catch (err) {
    console.error('Delete project error:', err);
    throw err;
  }
};

export const runOCR = async ({ user_id, project_id, file_id }) => {
  try {
    if (!user_id || !project_id) {
      throw new Error("user_id and project_id are required for OCR");
    }

    const formData = new URLSearchParams();
    formData.append("user_id", user_id);
    formData.append("project_id", project_id);
    if (file_id) formData.append("file_id", file_id);

    const response = await httpPost({
      url: OCR_URL,
      payload: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    return response?.data;
  } catch (err) {
    console.error("Run OCR error:", err);
    throw err;
  }
};

export const getOCRResults = async (projectId, userId) => {
  try {
    const response = await httpGet({
      url: `${OCR_URL}/${projectId}?user_id=${userId}`
    });
    return response?.data;
  } catch (err) {
    console.error('Get OCR results error:', err);
    throw err;
  }
};
