import api from "./interceptor/axiosInterceptor";

export const registerUser = async (userData) => {
  try {
    const response = await api.post("auth/register", userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("auth/login", credentials);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  console.error(
    "API Error:",
    error.response ? error.response.data : error.message
  );
  throw error;
};

export const getAllTemplate = async () => {
  try {
    const response = await api.get("template");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createTemplate = async (name) => {
  try {
    const response = await api.post("template", name);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const editTemplate = async (name, id) => {
  try {
    const response = await api.put(`template/${id}`, name);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteTemplate = async (id) => {
  try {
    const response = await api.delete(`template/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllExpense = async () => {
  try {
    const response = await api.get("expense");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createExpense = async (data) => {
  try {
    const response = await api.post("expense", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const editExpense = async (data, id) => {
  try {
    const response = await api.put(`expense/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`expense/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
