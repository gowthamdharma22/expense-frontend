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

export const createNoteUser = async (data) => {
  try {
    const response = await api.post("notes/user", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllNoteUser = async (data) => {
  try {
    const response = await api.get("notes/user");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateNoteUser = async (userId, data) => {
  try {
    const response = await api.put(`notes/user/${userId}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteNoteUser = async (userId) => {
  try {
    const response = await api.put(`notes/user/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyDay = async (dayId, verified) => {
  try {
    const response = await api.put(`day/${dayId}`, { isVerified: verified });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyDayExpense = async (dayExpenseId, status) => {
  try {
    const response = await api.put(`day-expense/${dayExpenseId}/verify`, {
      status,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
export const deleteDayExpense = async (dayExpenseId) => {
  try {
    const response = await api.delete(`day-expense/${dayExpenseId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
// day-expense/2

export const freezeDay = async (dayId, status) => {
  try {
    const response = await api.patch(`day/${dayId}/disableFreeze`, { status });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteDay = async (dayId) => {
  try {
    const response = await api.delete(`day/${dayId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
// day/62/disableFreeze

export const getNotesByShopId = async (shopId, filter) => {
  try {
    const response = await api.get(
      `transaction/notes/${shopId}?month=${filter}`
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//summary
export const getExpenseSummary = async (month, shopId) => {
  try {
    const response = await api.get(`day/summary/${month}?shopId=${shopId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getExpenseSummaryDetails = async (expenseId, month, shopId) => {
  try {
    const response = await api.get(
      `day-expense/summary/${expenseId}/${month}?shopId=${shopId}`
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// day/activeMonths/?shopId=1
export const getActiveMonths = async (shopId) => {
  try {
    const response = await api.get(`day/activeMonths?shopId=${shopId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
export const getAllNotes = async (shopId, month, userId) => {
  try {
    const query = [
      month ? `month=${month}` : "",
      userId ? `userId=${userId}` : "",
    ]
      .filter(Boolean)
      .join("&");

    const response = await api.get(`transaction/notes/${shopId}?${query}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
