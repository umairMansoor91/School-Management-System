import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import expenseService from '../../services/expenseService';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Category options based on API data
  const categoryOptions = [
    { value: 'RENT', display: 'Rent' },
    { value: 'UTILITY_BILLS', display: 'Utility Bills' },
    { value: 'ACADEMIC_EXPENSES', display: 'Academic Expenses' },
    { value: 'ADM_GEN_EXPENSES', display: 'Adm/ Gen Expenses' }
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchExpense = async () => {
        try {
          const response = await expenseService.getExpense(id);
          setFormData(response.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch expense details');
          setLoading(false);
          console.error('Error fetching expense:', err);
        }
      };

      fetchExpense();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format the amount to have 2 decimal places
      const dataToSubmit = {
        ...formData,
        amount: parseFloat(formData.amount).toFixed(2)
      };
      
      if (isEditMode) {
        await expenseService.updateExpense(id, dataToSubmit);
      } else {
        await expenseService.createExpense(dataToSubmit);
      }
      navigate('/expenses');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} expense`);
      setLoading(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} expense:`, err);
    }
  };

  if (loading && isEditMode) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.display}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount</label>
          <div className="input-group">
            <span className="input-group-text">Rs.</span>
            <input
              type="number"
              className="form-control"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter expense details..."
            required
          ></textarea>
        </div>
        
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/expenses')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;