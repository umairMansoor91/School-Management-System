import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    qualification: '',
    status: 'all', // 'all', 'active', or 'inactive'
    minSalary: '',
    maxSalary: '',
    hasDocument: 'all' // 'all', 'yes', or 'no'
  });

  // Get all unique qualifications for the dropdown
  const uniqueQualifications = [...new Set(teachers.map(teacher => teacher.qualification))];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teacherService.getAllTeachers();
        setTeachers(response.data);
        setFilteredTeachers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch teachers');
        setLoading(false);
        console.error('Error fetching teachers:', err);
      }
    };

    fetchTeachers();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    const applyFilters = () => {
      let result = [...teachers];
      
      // Filter by name
      if (filters.name) {
        result = result.filter(teacher => 
          teacher.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      
      // Filter by qualification
      if (filters.qualification) {
        result = result.filter(teacher => 
          teacher.qualification === filters.qualification
        );
      }
      
      // Filter by status
      if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        result = result.filter(teacher => teacher.enrolled === isActive);
      }
      
      // Filter by salary range
      if (filters.minSalary) {
        result = result.filter(teacher => teacher.pay >= Number(filters.minSalary));
      }
      
      if (filters.maxSalary) {
        result = result.filter(teacher => teacher.pay <= Number(filters.maxSalary));
      }
      
      // Filter by document presence
      if (filters.hasDocument !== 'all') {
        const hasDoc = filters.hasDocument === 'yes';
        result = result.filter(teacher => hasDoc ? !!teacher.teacher_doc : !teacher.teacher_doc);
      }
      
      setFilteredTeachers(result);
    };
    
    applyFilters();
  }, [filters, teachers]);

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
      qualification: '',
      status: 'all',
      minSalary: '',
      maxSalary: '',
      hasDocument: 'all'
    });
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Teachers</h2>
        <Link to="/teachers/new" className="btn btn-primary">Add New Teacher</Link>
      </div>
      
      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by name"
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Qualification</label>
              <select
                className="form-select"
                name="qualification"
                value={filters.qualification}
                onChange={handleFilterChange}
              >
                <option value="">All Qualifications</option>
                {uniqueQualifications.map((qual, index) => (
                  <option key={index} value={qual}>{qual}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Has Document</label>
              <select
                className="form-select"
                name="hasDocument"
                value={filters.hasDocument}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            <div className="col-md-1.5">
              <label className="form-label">Min Salary</label>
              <input
                type="number"
                className="form-control"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>
            
            <div className="col-md-1.5">
              <label className="form-label">Max Salary</label>
              <input
                type="number"
                className="form-control"
                name="maxSalary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                placeholder="Max"
              />
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
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </span>
      </div>
      
      {filteredTeachers.length === 0 ? (
        <div className="alert alert-info">No teachers found matching the filters</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Qualification</th>
                <th>Contact</th>
                <th>CNIC</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.id}</td>
                  <td>{teacher.name}</td>
                  <td>{teacher.qualification}</td>
                  <td>{teacher.contact}</td>
                  <td>{teacher.cnic}</td>
                  <td>Rs. {teacher.pay.toLocaleString()}</td>
                  <td>{new Date(teacher.joining_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${teacher.enrolled ? 'bg-success' : 'bg-danger'}`}>
                      {teacher.enrolled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {teacher.teacher_doc ? (
                      <a 
                        href={teacher.teacher_doc} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-outline-info"
                      >
                        <i className="bi bi-file-earmark-text me-1"></i>
                        View
                      </a>
                    ) : (
                      <span className="badge bg-secondary">No Document</span>
                    )}
                  </td>
                  <td>
                    <Link 
                      to={`/teachers/edit/${teacher.id}`} 
                      className="btn btn-sm btn-outline-primary"
                    >
                      Edit
                    </Link>
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

export default TeacherList;