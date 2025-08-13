// frontend/src/api/apiFunction/projectServices.js
import { PROJECT_URL } from "../restEndpoint";
import { httpPost, httpGet } from "../../utils/httpMethods";

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

export const getMyProjects = async () => {
  try {
    const response = await httpGet({ 
      url: PROJECT_URL + '/my-projects' 
    });
    return response?.data || [];
  } catch (err) {
    console.error('Get projects error:', err);
    throw err;
  }
};
