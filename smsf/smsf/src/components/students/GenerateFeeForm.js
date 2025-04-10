import React, { useState } from 'react';
import studentService from '../../services/studentService';

const GenerateFeeForm = ({ onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 10),
    exam_fee: "0.00",
    ac_charges: "0.00",
    stationary_charges: "0.00",
    lab_charges: "0.00"
  });

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
    setError(null);
    
    try {
      await studentService.generateFees(formData);
      setSuccess(true);
      setLoading(false);
      
      // Call the success callback after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError('Failed to generate fees: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      console.error('Error generating fees:', err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Generate Fee for Enrolled Students</h4>
            </div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success">
                  Fees generated successfully! Redirecting...
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="month" className="form-label">Month</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="month" 
                    name="month" 
                    value={formData.month} 
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">Fee generation month</small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="exam_fee" className="form-label">Exam Fee</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    id="exam_fee" 
                    name="exam_fee" 
                    value={formData.exam_fee} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="ac_charges" className="form-label">AC Charges</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    id="ac_charges" 
                    name="ac_charges" 
                    value={formData.ac_charges} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="stationary_charges" className="form-label">Stationary Charges</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    id="stationary_charges" 
                    name="stationary_charges" 
                    value={formData.stationary_charges} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="lab_charges" className="form-label">Lab Charges</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    id="lab_charges" 
                    name="lab_charges" 
                    value={formData.lab_charges} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <p className="text-muted mb-3">
                  Note: Serial number will be generated automatically by the server.
                </p>
                
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating...
                      </>
                    ) : 'Generate Fees'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateFeeForm;