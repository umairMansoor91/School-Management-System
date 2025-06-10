import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import GenerateFeeForm from './GenerateFeeForm';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  // Filter states - updated to match backend fields
  const [filters, setFilters] = useState({
    name: '',
    fatherName: '',
    grade: '',
    status: 'all', // 'all', 'enrolled', or 'not-enrolled'
    contactNumber: '',
    minTuitionFee: '',
    maxTuitionFee: '',
    minSecurityFee: '',
    maxSecurityFee: '',
    minAdmissionFee: '',
    maxAdmissionFee: '',
    minPendingFee: '',
    maxPendingFee: '',
    hasDocument: 'all' // 'all', 'yes', or 'no'
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentService.getAllStudents();
        setStudents(response.data);
        setFilteredStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch students');
        setLoading(false);
        console.error('Error fetching students:', err);
      }
    };

    fetchStudents();
  }, []);

  // Get all unique grades for the dropdown
  const uniqueGrades = [...new Set(students.map(student => student.grade))].sort();

  // Apply filters whenever filters state changes
  useEffect(() => {
    const applyFilters = () => {
      let result = [...students];
      
      // Filter by name
      if (filters.name) {
        result = result.filter(student => 
          student.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      
      // Filter by father's name
      if (filters.fatherName) {
        result = result.filter(student => 
          student.father_name.toLowerCase().includes(filters.fatherName.toLowerCase())
        );
      }
      
      // Filter by grade
      if (filters.grade) {
        result = result.filter(student => student.grade === parseInt(filters.grade));
      }
      
      // Filter by status
      if (filters.status !== 'all') {
        const isEnrolled = filters.status === 'enrolled';
        result = result.filter(student => student.enrolled === isEnrolled);
      }
      
      // Filter by contact number
      if (filters.contactNumber) {
        result = result.filter(student => 
          student.contact.includes(filters.contactNumber)
        );
      }
      
      // Filter by tuition fee range
      if (filters.minTuitionFee) {
        result = result.filter(student => 
          parseFloat(student.tuition_fee) >= parseFloat(filters.minTuitionFee)
        );
      }
      
      if (filters.maxTuitionFee) {
        result = result.filter(student => 
          parseFloat(student.tuition_fee) <= parseFloat(filters.maxTuitionFee)
        );
      }
      
      // Filter by security fee range
      if (filters.minSecurityFee) {
        result = result.filter(student => 
          parseFloat(student.security_fee) >= parseFloat(filters.minSecurityFee)
        );
      }
      
      if (filters.maxSecurityFee) {
        result = result.filter(student => 
          parseFloat(student.security_fee) <= parseFloat(filters.maxSecurityFee)
        );
      }
      
      // Filter by admission fee range
      if (filters.minAdmissionFee) {
        result = result.filter(student => 
          parseFloat(student.admission_fee) >= parseFloat(filters.minAdmissionFee)
        );
      }
      
      if (filters.maxAdmissionFee) {
        result = result.filter(student => 
          parseFloat(student.admission_fee) <= parseFloat(filters.maxAdmissionFee)
        );
      }
      
      // Filter by pending fee range
      if (filters.minPendingFee) {
        result = result.filter(student => 
          parseFloat(student.pending_fee) >= parseFloat(filters.minPendingFee)
        );
      }
      
      if (filters.maxPendingFee) {
        result = result.filter(student => 
          parseFloat(student.pending_fee) <= parseFloat(filters.maxPendingFee)
        );
      }
      
      // Filter by document presence
      if (filters.hasDocument !== 'all') {
        const hasDoc = filters.hasDocument === 'yes';
        result = result.filter(student => 
          Boolean(student.scanned_doc) === hasDoc
        );
      }
      
      setFilteredStudents(result);
    };
    
    applyFilters();
  }, [filters, students]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      fatherName: '',
      grade: '',
      status: 'all',
      contactNumber: '',
      minTuitionFee: '',
      maxTuitionFee: '',
      minSecurityFee: '',
      maxSecurityFee: '',
      minAdmissionFee: '',
      maxAdmissionFee: '',
      minPendingFee: '',
      maxPendingFee: '',
      hasDocument: 'all'
    });
  };

  const handleGenerateFee = () => {
    setShowFeeForm(true);
  };

  const handleDelete = async (rollNo) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(rollNo);
        // Update the state by removing the deleted student
        setStudents(students.filter(student => student.roll_no !== rollNo));
      } catch (err) {
        setError('Failed to delete student');
        console.error('Error deleting student:', err);
      }
    }
  };
  
  const openDocumentModal = (docUrl) => {
    setSelectedDocument(docUrl);
    setShowModal(true);
  };
  
  const closeDocumentModal = () => {
    setSelectedDocument(null);
    setShowModal(false);
  };

  // Handle navigation to add new student
  const handleAddNewStudent = () => {
    navigate('/students/new');
  };

  // Handle navigation to edit student
  const handleEditStudent = (id) => {
    navigate(`/students/edit/${id}`);
  };

  // Format currency display
  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  if (showFeeForm) {
    return <GenerateFeeForm 
      onCancel={() => setShowFeeForm(false)} 
      onSuccess={() => {
        setShowFeeForm(false);
        // Optionally refresh the students list
      }} 
    />;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Students</h2>
        <div className="d-flex gap-2">
          <button onClick={handleGenerateFee} className="btn btn-success">Generate Fee</button>
          <button onClick={handleAddNewStudent} className="btn btn-primary">
            <i className="bi bi-plus-circle me-1"></i> Add New Student
          </button>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3 col-lg-2">
              <label className="form-label">Student Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by name"
              />
            </div>
            
            <div className="col-md-3 col-lg-2">
              <label className="form-label">Father's Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="fatherName"
                value={filters.fatherName}
                onChange={handleFilterChange}
                placeholder="Search by father's name"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Grade</label>
              <select
                className="form-select form-select-sm"
                name="grade"
                value={filters.grade}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {uniqueGrades.map((grade, index) => (
                  <option key={index} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Status</label>
              <select
                className="form-select form-select-sm"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="enrolled">Enrolled</option>
                <option value="not-enrolled">Not Enrolled</option>
              </select>
            </div>
            
            <div className="col-md-2 col-lg-2">
              <label className="form-label">Contact</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="contactNumber"
                value={filters.contactNumber}
                onChange={handleFilterChange}
                placeholder="Search by contact"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Document</label>
              <select
                className="form-select form-select-sm"
                name="hasDocument"
                value={filters.hasDocument}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="yes">With Doc</option>
                <option value="no">No Doc</option>
              </select>
            </div>
            
            {/* Fee Range Filters */}
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Min Tuition</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="minTuitionFee"
                value={filters.minTuitionFee}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Max Tuition</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="maxTuitionFee"
                value={filters.maxTuitionFee}
                onChange={handleFilterChange}
                placeholder="Max"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Min Security</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="minSecurityFee"
                value={filters.minSecurityFee}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Max Security</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="maxSecurityFee"
                value={filters.maxSecurityFee}
                onChange={handleFilterChange}
                placeholder="Max"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Min Admission</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="minAdmissionFee"
                value={filters.minAdmissionFee}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Max Admission</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="maxAdmissionFee"
                value={filters.maxAdmissionFee}
                onChange={handleFilterChange}
                placeholder="Max"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Min Pending</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="minPendingFee"
                value={filters.minPendingFee}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>
            
            <div className="col-md-2 col-lg-1">
              <label className="form-label">Max Pending</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="maxPendingFee"
                value={filters.maxPendingFee}
                onChange={handleFilterChange}
                placeholder="Max"
              />
            </div>
          </div>
          
          <div className="d-flex justify-content-end mt-3">
            <button 
              className="btn btn-secondary btn-sm" 
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
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="alert alert-info">No students found matching the filters</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover table-sm">
            <thead className="table-dark">
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Grade</th>
                <th>Contact</th>
                <th>DOB</th>
                <th>Admission Date</th>
                <th>Tuition Fee</th>
                <th>Security Fee</th>
                <th>Admission Fee</th>
                <th>Pending Fee</th>
                <th>Status</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.roll_no}>
                  <td>{student.roll_no}</td>
                  <td>{student.name}</td>
                  <td>{student.father_name}</td>
                  <td>{student.grade}</td>
                  <td>{student.contact}</td>
                  <td>{formatDate(student.DOB)}</td>
                  <td>{formatDate(student.admission_date)}</td>
                  <td>Rs{formatCurrency(student.tuition_fee)}</td>
                  <td>Rs{formatCurrency(student.security_fee)}</td>
                  <td>Rs{formatCurrency(student.admission_fee)}</td>
                  <td>
                    <span className={`badge ${parseFloat(student.pending_fee) > 0 ? 'bg-warning text-dark' : 'bg-success'}`}>
                      Rs{formatCurrency(student.pending_fee)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${student.enrolled ? 'bg-success' : 'bg-danger'}`}>
                      {student.enrolled ? 'Enrolled' : 'Not Enrolled'}
                    </span>
                  </td>
                  <td>
                    {student.scanned_doc ? (
                      <button 
                        className="btn btn-sm btn-info" 
                        onClick={() => openDocumentModal(student.scanned_doc)}
                        title="View Document"
                      >
                        <i className="bi bi-file-earmark"></i> View
                      </button>
                    ) : (
                      <span className="badge bg-secondary">No Document</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEditStudent(student.roll_no)}
                        title="Edit Student"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(student.roll_no)}
                        title="Delete Student"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Document Modal */}
      {selectedDocument && showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Student Document</h5>
                <button type="button" className="btn-close" onClick={closeDocumentModal}></button>
              </div>
              <div className="modal-body text-center">
                {selectedDocument.endsWith('.pdf') ? (
                  <div>
                    <iframe 
                      src={selectedDocument} 
                      title="PDF Document" 
                      width="100%" 
                      height="500px" 
                      style={{ border: 'none' }}
                    />
                  </div>
                ) : (
                  <img 
                    src={selectedDocument} 
                    alt="Student Document" 
                    className="img-fluid" 
                    style={{ maxHeight: '70vh' }}
                  />
                )}
              </div>
              <div className="modal-footer">
                <a 
                  href={selectedDocument} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                >
                  <i className="bi bi-download"></i> Download Document
                </a>
                <button type="button" className="btn btn-secondary" onClick={closeDocumentModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;