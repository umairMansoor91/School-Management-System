import api from './api';

// Expense API services
const expenseService = {
  // Get all expenses
  getAllExpenses: () => {
    return api.get('/api/expenses/');
  },
  
  // Get expense by ID
  getExpense: (id) => {
    return api.get(`/api/expenses/${id}/`);
  },
  
  // Create new expense
  createExpense: (expenseData) => {
    return api.post('/api/expenses/', expenseData);
  },
  
  // Update expense
  updateExpense: (id, expenseData) => {
    return api.put(`/api/expenses/${id}/`, expenseData);
  },
  
  // Delete expense
  deleteExpense: (id) => {
    return api.delete(`/api/expenses/${id}/`);
  }
};

export default expenseService;
