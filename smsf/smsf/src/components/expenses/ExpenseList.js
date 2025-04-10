import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import expenseService from '../../services/expenseService';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Category options
  const categoryOptions = [
    { value: 'RENT', display: 'Rent' },
    { value: 'UTILITY_BILLS', display: 'Utility Bills' },
    { value: 'ACADEMIC_EXPENSES', display: 'Academic Expenses' },
    { value: 'ADM_GEN_EXPENSES', display: 'Adm/ Gen Expenses' }
  ];

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await expenseService.getAllExpenses();
        setExpenses(response.data);
        setFilteredExpenses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch expenses');
        setLoading(false);
        console.error('Error fetching expenses:', err);
      }
    };

    fetchExpenses();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  // Convert date string in M/D/YYYY format to a standardized Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // For M/D/YYYY format (from database)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Create a new date object and explicitly set year, month, day
      const date = new Date(0); // Start with epoch time
      date.setFullYear(parseInt(parts[2], 10));
      date.setMonth(parseInt(parts[0], 10) - 1); // months are 0-indexed
      date.setDate(parseInt(parts[1], 10));
      date.setHours(0, 0, 0, 0); // Reset time component
      return date;
    }
    
    // For YYYY-MM-DD format (from input fields) - attempt direct parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0); // Reset time component
      return date;
    }
    
    return null; // Return null for invalid dates
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // For debugging purposes - add to see what's happening
  const logDateComparison = (expenseDate, fromDate, toDate) => {
    console.log('Expense Date:', expenseDate);
    console.log('From Date:', fromDate);
    console.log('To Date:', toDate);
    console.log('After From Date:', !fromDate || expenseDate >= fromDate);
    console.log('Before To Date:', !toDate || expenseDate <= toDate);
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Filter by date range
    if (filters.fromDate || filters.toDate) {
      let fromDate = filters.fromDate ? parseDate(filters.fromDate) : null;
      let toDate = filters.toDate ? parseDate(filters.toDate) : null;
      
      // If toDate is provided, set it to end of day for inclusive comparison
      if (toDate) {
        toDate = new Date(toDate);
        toDate.setHours(23, 59, 59, 999);
      }
      
      filtered = filtered.filter(expense => {
        const expenseDate = parseDate(expense.date);
        if (!expenseDate) {
          console.warn('Failed to parse expense date:', expense.date);
          return true; // Skip this filter if date parsing fails
        }
        
        // Uncomment for debugging
        // logDateComparison(expenseDate, fromDate, toDate);
        
        // Check if expense date is within range
        const afterFromDate = !fromDate || expenseDate >= fromDate;
        const beforeToDate = !toDate || expenseDate <= toDate;
        
        return afterFromDate && beforeToDate;
      });
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(expense => 
        expense.category === filters.category
      );
    }

    // Filter by min amount
    if (filters.minAmount) {
      filtered = filtered.filter(expense => 
        parseFloat(expense.amount) >= parseFloat(filters.minAmount)
      );
    }

    // Filter by max amount
    if (filters.maxAmount) {
      filtered = filtered.filter(expense => 
        parseFloat(expense.amount) <= parseFloat(filters.maxAmount)
      );
    }

    setFilteredExpenses(filtered);
  };

  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      category: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        setExpenses(expenses.filter(expense => expense.id !== id));
        setFilteredExpenses(filteredExpenses.filter(expense => expense.id !== id));
      } catch (err) {
        setError('Failed to delete expense');
        console.error('Error deleting expense:', err);
      }
    }
  };

  // Format date for display in table
  const formatDate = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? date.toLocaleDateString() : dateStr;
  };

  // Calculate total of filtered expenses
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount), 
    0
  ).toFixed(2);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Expenses</h2>
        <Link to="/expenses/new" className="btn btn-primary">Add New Expense</Link>
      </div>
      
      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="fromDate" className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                id="fromDate"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="toDate" className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                id="toDate"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="minAmount" className="form-label">Min Amount (Rs.)</label>
              <input
                type="number"
                className="form-control"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="maxAmount" className="form-label">Max Amount (Rs.)</label>
              <input
                type="number"
                className="form-control"
                id="maxAmount"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
            
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-secondary w-100" 
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="d-flex justify-content-between mb-3">
        <p className="mb-0">Showing {filteredExpenses.length} of {expenses.length} expenses</p>
        <p className="mb-0 fw-bold">Total: Rs. {totalAmount}</p>
      </div>
      
      {filteredExpenses.length === 0 ? (
        <div className="alert alert-info">No expenses found matching your criteria</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.id}</td>
                  <td>{expense.description}</td>
                  <td>
                    {categoryOptions.find(cat => cat.value === expense.category)?.display || expense.category}
                  </td>
                  <td>Rs. {parseFloat(expense.amount).toFixed(2)}</td>
                  <td>{expense.date}</td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <Link 
                        to={`/expenses/edit/${expense.id}`} 
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;