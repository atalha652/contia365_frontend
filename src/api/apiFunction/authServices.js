import { AUTH_URL } from "../restEndpoint";
import { authHttpPost, httpGetWithOutToken } from "../../utils/httpMethods";

export const signUp = async (data) => {
  try {
    const response = await authHttpPost({ 
      url: AUTH_URL + '/signup', 
      payload: data 
    });
    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return err?.response || { status: 500, data: { message: 'An unexpected error occurred' } };
  }
};


export const login = async (data) => {
  try {
    const response = await authHttpPost({ 
      url: AUTH_URL + '/login', 
      payload: data 
    });
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return err?.response || { status: 500, data: { message: 'An unexpected error occurred' } };
  }
};


export const getOrgTypes = async () => {
  try {
    const response = await httpGetWithOutToken({ 
      url: AUTH_URL + '/org-types' 
    });
    return response?.data || [];
  } catch (err) {
    console.error('Error fetching organization types:', err);
    return [];
  }
};