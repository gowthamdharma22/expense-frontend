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

export const getExpenseById = async (id) => {
  try {
    const response = await api.get(`expense/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getExpenseByTemplateId = async (id) => {
  try {
    const response = await api.get(`/expense/template/${id}`);
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

export const getAllShop = async () => {
  try {
    const response = await api.get("shop");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createShop = async (data) => {
  try {
    const response = await api.post("shop", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const editShop = async (data, id) => {
  try {
    const response = await api.put(`shop/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteShop = async (id) => {
  try {
    const response = await api.delete(`shop/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//day
export const createDay = async (data) => {
  try {
    const response = await api.post("day/create", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getDayByDate = async (date, shopId) => {
  try {
    const response = await api.get(`day/date/${date}?shopId=${shopId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getDayExpenseByDate = async (date, shopId) => {
  try {
    const response = await api.get(`day-expense/${date}?shopId=${shopId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getExpenseByShopId = async (shopId) => {
  try {
    const response = await api.get(`expense/shop/${shopId}?nonDefault=true`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createDayExpense = async (data) => {
  try {
    const response = await api.post("day-expense", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateDayExpense = async (id, data) => {
  try {
    const response = await api.put(`day-expense/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const adjustTransaction = async (data) => {
  try {
    const response = await api.post("transaction/adjust", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
