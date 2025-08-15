// frontend/src/api/apiFunction/projectServices.js
import { PROJECT_URL } from "../restEndpoint";
import { httpPost, httpGet, httpDelete } from "../../utils/httpMethods";

export const createProject = async (data) => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add required fields
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.color) formData.append('color', data.color);
    if (data.file) formData.append('file', data.file);
    
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
