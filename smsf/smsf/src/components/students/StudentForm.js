import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    father_name: '',
    contact: '',
    DOB: '',
    admission_date: new Date().toISOString().split('T')[0],
    address: '',
    tuition_fee: '', // Fixed typo from 'tution_fee'
    security_fee: '',
    admission_fee: '',
    pending_fee: '',
    enrolled: true
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [scannedDoc, setScannedDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileChanged, setFileChanged] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchStudent = async () => {
        try {
          const response = await studentService.getStudent(id);
          setFormData(response.data);
          
          // Set document preview if available
          if (response.data.scanned_doc) {
            setPreviewUrl(response.data.scanned_doc);
          }
          
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch student details');
          setLoading(false);
          console.error('Error fetching student:', err);
        }
      };

      fetchStudent();
    }
  }, [id, isEditMode]);

  // Add effect to navigate after success state is set
  useEffect(() => {
    if (submitSuccess) {
      navigate('/students');
    }
  }, [submitSuccess, navigate]);

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
      setScannedDoc(file);
      setFileChanged(true);
      // Create a preview URL for the selected file
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any previous errors
  
    try {
      // Format and sanitize numeric fields
      const dataToSubmit = {
        ...formData,
        grade: parseInt(formData.grade, 10),
        tuition_fee: parseFloat(formData.tuition_fee || 0), // Fixed field name
        security_fee: parseFloat(formData.security_fee || 0),
        admission_fee: parseFloat(formData.admission_fee || 0),
        pending_fee: parseFloat(formData.pending_fee || 0)
      };
  
      // Create FormData object for multipart/form-data
      const formDataWithFile = new FormData();
  
      // Append all fields to FormData with proper type handling
      Object.entries(dataToSubmit).forEach(([key, value]) => {
        // Skip the scanned_doc field - we'll handle it separately
        if (key !== 'scanned_doc') {
          if (key === 'enrolled') {
            // Handle boolean values correctly
            formDataWithFile.append(key, value);
          } else {
            formDataWithFile.append(key, value !== null ? value.toString() : '');
          }
        }
      });
  
      // Only append the file if a new one was selected
      if (fileChanged && scannedDoc) {
        formDataWithFile.append('scanned_doc', scannedDoc);
      }
      
      // When no new file is selected in edit mode, don't include the field at all
      // This prevents the "not a file" error
  
      // Use PATCH for edit mode
      if (isEditMode) {
        await studentService.updateStudent(id, formDataWithFile);
      } else {
        await studentService.createStudent(formDataWithFile);
      }
  
      setSubmitSuccess(true); // Success triggers redirect via useEffect
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} student`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} student:`, err);
      console.log('Backend response error:', err.response?.data); // helpful for debugging
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Helper function to clear the selected file
  const clearSelectedFile = () => {
    setScannedDoc(null);
    setFileChanged(true); // Mark as changed to handle deletion properly
    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{isEditMode ? 'Edit Student' : 'Add New Student'}</h4>
          {error && <div className="badge bg-danger">{error}</div>}
          {submitSuccess && <div className="badge bg-success">Student saved successfully!</div>}
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row g-3">
              {/* Personal Information Section */}
              <div className="col-12">
                <h5 className="border-bottom pb-2 text-secondary">Personal Information</h5>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="name">Full Name</label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="father_name"
                    name="father_name"
                    placeholder="Father's Name"
                    value={formData.father_name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="father_name">Father's Name</label>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-floating mb-3">
                  <input
                    type="date"
                    className="form-control"
                    id="DOB"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="DOB">Date of Birth</label>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="contact"
                    name="contact"
                    placeholder="Contact Number"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="contact">Contact Number</label>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    className="form-control"
                    id="grade"
                    name="grade"
                    placeholder="Grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="grade">Grade</label>
                </div>
              </div>
              
              <div className="col-12">
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    style={{ height: '100px' }}
                  ></textarea>
                  <label htmlFor="address">Address</label>
                </div>
              </div>
              
              {/* Document Upload Section */}
              <div className="col-12 mt-2">
                <h5 className="border-bottom pb-2 text-secondary">Document Upload</h5>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="scanned_doc" className="form-label">Scanned Document</label>
                <input
                  type="file"
                  className="form-control"
                  id="scanned_doc"
                  name="scanned_doc"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                <div className="form-text">Upload scanned admission form image i.e. jpg, jpeg, png etc.</div>
              </div>
              
              <div className="col-md-6">
                {previewUrl && (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Document Preview:</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger"
                        onClick={clearSelectedFile}
                      >
                        <i className="bi bi-x-circle"></i> Remove
                      </button>
                    </div>
                    {previewUrl.endsWith('.pdf') ? (
                      <div className="border p-3 text-center bg-light">
                        <i className="bi bi-file-earmark-pdf fs-1 text-danger"></i>
                        <p className="mb-0">PDF Document</p>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary mt-2">
                          View PDF
                        </a>
                      </div>
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Document Preview" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '200px' }} 
                      />
                    )}
                  </div>
                )}
              </div>
              
              {/* Admission Details Section */}
              <div className="col-12 mt-2">
                <h5 className="border-bottom pb-2 text-secondary">Admission Details</h5>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="date"
                    className="form-control"
                    id="admission_date"
                    name="admission_date"
                    value={formData.admission_date}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="admission_date">Admission Date</label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-check form-switch p-3 mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="enrolled"
                    name="enrolled"
                    checked={formData.enrolled}
                    onChange={handleChange}
                    style={{ width: '3em', height: '1.5em' }}
                  />
                  <label className="form-check-label ms-2" htmlFor="enrolled">
                    <span className={`badge ${formData.enrolled ? 'bg-success' : 'bg-secondary'}`}>
                      {formData.enrolled ? 'Currently Enrolled' : 'Not Enrolled'}
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Fee Structure Section */}
              <div className="col-12 mt-2">
                <h5 className="border-bottom pb-2 text-secondary">Fee Structure</h5>
              </div>
              
              <div className="col-md-3">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="tuition_fee"
                    name="tuition_fee"
                    placeholder="Tuition Fee"
                    value={formData.tuition_fee}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="tuition_fee">Tuition Fee (Rs.)</label>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="security_fee"
                    name="security_fee"
                    placeholder="Security Fee"
                    value={formData.security_fee}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="security_fee">Security Fee (Rs.)</label>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="admission_fee"
                    name="admission_fee"
                    placeholder="Admission Fee"
                    value={formData.admission_fee}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="admission_fee">Admission Fee (Rs.)</label>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="pending_fee"
                    name="pending_fee"
                    placeholder="Pending Fee"
                    value={formData.pending_fee}
                    onChange={handleChange}
                    readOnly={isEditMode} // Make it read-only in edit mode since it's calculated
                  />
                  <label htmlFor="pending_fee">Pending Fee (Rs.)</label>
                  {isEditMode && (
                    <div className="form-text">
                      <small className="text-info">
                        <i className="bi bi-info-circle"></i> This is automatically calculated from fee records
                      </small>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show pending fee info in edit mode */}
              {isEditMode && formData.pending_fee > 0 && (
                <div className="col-12">
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Outstanding Balance:</strong> This student has a pending fee of Rs. {formData.pending_fee}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="d-flex gap-2 mt-4 justify-content-end">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => navigate('/students')}
              >
                <i className="bi bi-arrow-left me-1"></i> Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> Save Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;