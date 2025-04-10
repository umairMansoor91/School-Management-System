import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const GenTeacherPayment = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [formData, setFormData] = useState({
    payment_date: '',
    payment_method: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teacherService.getAllTeachers();
        setTeachers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch teachers');
        setLoading(false);
        console.error('Error fetching teachers:', err);
      }
    };

    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTeacherSelection = (e, teacherId) => {
    if (e.target.checked) {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    } else {
      setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTeachers(teachers.map(teacher => teacher.id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedTeachers.length === 0) {
      setError('Please select at least one teacher');
      return;
    }
    
    setGenerating(true);
    
    try {
      // In a real application, you would send the selected teachers and form data
      // to generate payments for multiple teachers at once
      const paymentData = {
        ...formData,
        teachers: selectedTeachers
      };
      
      await teacherService.createGenTeacherPayment(paymentData);
      navigate('/teacher-payments');
    } catch (err) {
      setError('Failed to generate payments');
      setGenerating(false);
      console.error('Error generating payments:', err);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Generate Teacher Payments</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="payment_date" className="form-label">Payment Date</label>
          <input
            type="date"
            className="form-control"
            id="payment_date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="payment_method" className="form-label">Payment Method</label>
          <select
            className="form-select"
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
            <option value="Online">Online</option>
          </select>
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
          ></textarea>
        </div>
        
        <div className="card mb-4">
          <div className="card-header">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="selectAll"
                checked={selectedTeachers.length === teachers.length}
                onChange={handleSelectAll}
              />
              <label className="form-check-label" htmlFor="selectAll">
                Select All Teachers
              </label>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              {teachers.map(teacher => (
                <div key={teacher.id} className="col-md-4 mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`teacher-${teacher.id}`}
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={(e) => handleTeacherSelection(e, teacher.id)}
                    />
                    <label className="form-check-label" htmlFor={`teacher-${teacher.id}`}>
                      {teacher.name} - ${teacher.salary}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={generating}>
            {generating ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Generating...</span>
              </>
            ) : (
              'Generate Payments'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/teacher-payments')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenTeacherPayment;
