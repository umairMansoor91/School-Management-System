import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const TeacherPaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substr(0, 7)); // YYYY-MM format
  const [generating, setGenerating] = useState(false);
  
  // Filter states
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    teacher: '',
    month: '',
    status: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever payments or filters change
    applyFilters();
  }, [payments, filters]);

  const applyFilters = () => {
    let result = [...payments];
    
    // Filter by teacher
    if (filters.teacher) {
      result = result.filter(payment => 
        payment.teacher === parseInt(filters.teacher)
      );
    }
    
    // Filter by month
    if (filters.month) {
      const filterMonth = new Date(filters.month + '-01').toISOString().substr(0, 7);
      result = result.filter(payment => 
        new Date(payment.month).toISOString().substr(0, 7) === filterMonth
      );
    }
    
    // Filter by status
    if (filters.status) {
      const isPaid = filters.status === 'paid';
      result = result.filter(payment => payment.paid === isPaid);
    }
    
    setFilteredPayments(result);
  };

  const fetchData = async () => {
    try {
      // Fetch both payment data and teacher data
      const [paymentsResponse, teachersResponse] = await Promise.all([
        teacherService.getAllTeacherPayments(),
        teacherService.getAllTeachers()
      ]);
      
      setPayments(paymentsResponse.data);
      setFilteredPayments(paymentsResponse.data);
      setTeachers(teachersResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  // Function to get teacher name by id
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(teacher => teacher.id === teacherId);
    return teacher ? teacher.name : `Unknown (ID: ${teacherId})`;
  };

  const handleGeneratePay = async () => {
    setGenerating(true);
    try {
      // Add date to make it a full date string (first day of month)
      const fullDate = `${selectedMonth}-01`;
      
      // Use the teacherService method for generating teacher pay
      await teacherService.createGenTeacherPayment({
        month: fullDate
      });
      
      // Refresh the data after generation
      await fetchData();
      setShowModal(false);
      
      // Show success message (you could implement a toast notification here)
      alert('Teacher payments generated successfully!');
    } catch (err) {
      setError('Failed to generate teacher payments');
      console.error('Error generating payments:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      teacher: '',
      month: '',
      status: ''
    });
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    setDeleting(true);
    try {
      await teacherService.deleteTeacherPayment(paymentToDelete.id);
      
      // Remove the deleted payment from state
      setPayments(prev => prev.filter(p => p.id !== paymentToDelete.id));
      setShowDeleteModal(false);
      alert('Payment deleted successfully!');
    } catch (err) {
      setError('Failed to delete payment');
      console.error('Error deleting payment:', err);
    } finally {
      setDeleting(false);
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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Teacher Payments</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          Generate Teacher Pay
        </button>
      </div>
      
      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Teacher</label>
              <select 
                className="form-select" 
                name="teacher"
                value={filters.teacher}
                onChange={handleFilterChange}
              >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Month</label>
              <input 
                type="month" 
                className="form-control" 
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Payment Status</label>
              <select 
                className="form-select" 
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="d-flex justify-content-end mt-3">
            <button 
              className="btn btn-secondary" 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-3">
        <span className="text-muted">
          Showing {filteredPayments.length} of {payments.length} payments
        </span>
      </div>
      
      {filteredPayments.length === 0 ? (
        <div className="alert alert-info">No payment records found matching the filters</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Teacher</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{getTeacherName(payment.teacher)}</td>
                  <td>{new Date(payment.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</td>
                  <td>Rs.{payment.pay?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <span className={`badge ${payment.paid ? 'bg-success' : 'bg-warning'}`}>
                      {payment.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <Link 
                        to={`/teacher-payments/edit/${payment.id}`} 
                        className="btn btn-sm btn-outline-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(payment)}
                        className="btn btn-sm btn-outline-danger ms-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Pay Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generate Teacher Payments</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  disabled={generating}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="month" className="form-label">Select Month</label>
                    <input
                      type="month"
                      className="form-control"
                      id="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={generating}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleGeneratePay}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the payment for {getTeacherName(paymentToDelete?.teacher)} 
                for {paymentToDelete ? new Date(paymentToDelete.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : ''}?</p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeletePayment}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPaymentList;