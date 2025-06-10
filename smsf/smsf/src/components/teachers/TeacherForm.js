import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    cnic: '',
    qualification: '',
    pay: '',
    joining_date: '',
    enrolled: true,
    teacher_doc: null
  });
  
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchTeacher = async () => {
        try {
          const response = await teacherService.getTeacher(id);
          setFormData(response.data);
          if (response.data.teacher_doc) {
            setFilePreview(response.data.teacher_doc);
          }
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch teacher details');
          setLoading(false);
          console.error('Error fetching teacher:', err);
        }
      };

      fetchTeacher();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        teacher_doc: file
      });
      
      // Create a preview URL for the file
      const fileUrl = URL.createObjectURL(file);
      setFilePreview(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const teacherFormData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'teacher_doc' && formData[key] instanceof File) {
          teacherFormData.append(key, formData[key]);
        } else if (key !== 'teacher_doc' || formData[key] !== null) {
          teacherFormData.append(key, formData[key]);
        }
      });
      
      if (isEditMode) {
        await teacherService.updateTeacher(id, teacherFormData);
      } else {
        await teacherService.createTeacher(teacherFormData);
      }
      navigate('/teachers');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} teacher`);
      setLoading(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} teacher:`, err);
    }
  };

  if (loading && isEditMode) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label fw-bold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="contact" className="form-label fw-bold">Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="e.g., 03335465214"
                      required
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="cnic" className="form-label fw-bold">CNIC</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cnic"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleChange}
                      placeholder="e.g., 35214-5565845-1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="qualification" className="form-label fw-bold">Qualification</label>
                    <input
                      type="text"
                      className="form-control"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g., MSc Physics"
                      required
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="pay" className="form-label fw-bold">Salary</label>
                    <div className="input-group">
                      <span className="input-group-text">Rs.</span>
                      <input
                        type="number"
                        className="form-control"
                        id="pay"
                        name="pay"
                        value={formData.pay}
                        onChange={handleChange}
                        placeholder="Enter salary amount"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="joining_date" className="form-label fw-bold">Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="joining_date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-12">
                    <label htmlFor="teacher_doc" className="form-label fw-bold">Document Upload</label>
                    <input
                      type="file"
                      className="form-control"
                      id="teacher_doc"
                      name="teacher_doc"
                      onChange={handleFileChange}
                    />
                    <div className="form-text">Upload teacher documents (resume, certificates, etc.)</div>
                    
                    {filePreview && (
                      <div className="mt-2">
                        <label className="form-label">Current Document:</label>
                        <div className="d-flex align-items-center">
                          <div className="border p-2 rounded me-2">
                            <i className="bi bi-file-earmark-text fs-4"></i>
                          </div>
                          <a 
                            href={filePreview} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary text-decoration-none"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enrolled"
                      name="enrolled"
                      checked={formData.enrolled}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="enrolled">
                      Currently Enrolled
                    </label>
                  </div>
                </div>
                
                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={() => navigate('/teachers')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Teacher'
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

export default TeacherForm;