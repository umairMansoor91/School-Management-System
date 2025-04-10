import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const TeacherPaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    teacher: '',
    month: '',
    pay: '',
    paid: false
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersResponse = await teacherService.getAllTeachers();
        setTeachers(teachersResponse.data);
        
        if (isEditMode) {
          const paymentResponse = await teacherService.getTeacherPayment(id);
          setFormData({
            ...paymentResponse.data,
            // Format the date to YYYY-MM-DD for the input
            month: paymentResponse.data.month ? paymentResponse.data.month.substring(0, 10) : ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        await teacherService.updateTeacherPayment(id, formData);
      } else {
        await teacherService.createTeacherPayment(formData);
      }
      navigate('/teacher-payments');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} payment record`);
      setSubmitting(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} payment:`, err);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{isEditMode ? 'Edit Payment Record' : 'Add New Payment'}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="teacher" className="form-label fw-bold">Teacher</label>
                  <select
                    className="form-select"
                    id="teacher"
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    required
                    disabled={isEditMode} // Cannot change teacher on edit
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="month" className="form-label fw-bold">Month</label>
                  <input
                    type="date"
                    className="form-control"
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                    disabled={isEditMode} // Cannot change month on edit
                  />
                  {isEditMode && (
                    <small className="text-muted">Month cannot be changed after creation</small>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="pay" className="form-label fw-bold">Payment Amount</label>
                  <div className="input-group">
                    <span className="input-group-text">Rs.</span>
                    <input
                      type="number"
                      className="form-control"
                      id="pay"
                      name="pay"
                      value={formData.pay}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="paid"
                      name="paid"
                      checked={formData.paid}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="paid">
                      Payment Status: {formData.paid ? 'Paid' : 'Pending'}
                    </label>
                  </div>
                </div>
                
                <div className="d-flex gap-2 justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={() => navigate('/teacher-payments')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Payment'
                    )}
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

export default TeacherPaymentForm;