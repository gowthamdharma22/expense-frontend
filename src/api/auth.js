import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  console.error('API Error:', error.response ? error.response.data : error.message);
  throw error;
};

export const getAllTemplate = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/template`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createTemplate = async (name) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/template`, name);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const editTemplate = async (name,id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/template/${id}`, name);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteTemplate = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/template/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};




export const getAllExpense = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/expense`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createExpense = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/expense`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const editExpense = async (data, id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/expense/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/expense/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
