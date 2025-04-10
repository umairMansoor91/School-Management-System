import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';

const StudentFeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id; // Fix: use id from params instead of roll_no
  
  // Original state from the server
  const [originalData, setOriginalData] = useState(null);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student: '',  // Add student ID field
    student_info: {
      roll_no: '',
      name: '',
      grade: ''
    },
    month: new Date().toISOString().split('T')[0],
    tuition_fee: '0.00',
    exam_fee: '0.00',
    ac_charges: '0.00',
    stationary_charges: '0.00',
    admission_fee: '0.00',
    lab_charges: '0.00',
    security_fee: '0.00',
    misc: '0.00',
    description: '',
    total_fee: '0.00',
    paid: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await studentService.getAllStudents();
        setStudents(studentsResponse.data);
  
        if (isEditMode) {
          const feeResponse = await studentService.getStudentFee(id);
          setOriginalData(feeResponse.data);
          console.log("Fee Response Data:", feeResponse.data);
  
          // Set form data directly from fee response
          setFormData(feeResponse.data);
  
          // Extract student ID from the response for correct submission
          const studentId = feeResponse.data.student || 
                           (feeResponse.data.student_info ? 
                            feeResponse.data.student_info.roll_no : null);
  
          if (studentId) {
            const studentIdStr = studentId.toString();
            setSelectedStudent(studentIdStr);
            setFormData((prev) => ({
              ...prev,
              student: studentIdStr,
            }));
  
            console.log("Selected student ID:", studentIdStr);
          } else {
            console.error("Missing student ID in response data.");
            setError("Could not identify student. Please contact support.");
          }
        }
  
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data: " + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, isEditMode]);

  const calculateTotal = (data) => {
    const fields = [
      'tuition_fee', 'exam_fee', 'ac_charges', 'stationary_charges',
      'admission_fee', 'lab_charges', 'security_fee', 'misc'
    ];
    
    const total = fields.reduce((sum, field) => {
      return sum + parseFloat(data[field] || 0);
    }, 0);
    
    return total.toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'student') {
      setSelectedStudent(value);
      // Find selected student and update student_info
      const student = students.find(s => s.id !== undefined && s.id.toString() === value);
      if (student) {
        setFormData({
          ...formData,
          student: student.id, // Store student ID
          student_info: {
            roll_no: student.roll_no,
            name: student.name,
            grade: student.class_name || student.grade
          }
        });
      }
      return;
    }
    
    // Handle fee fields - recalculate total fee whenever a fee field changes
    const feeFields = [
      'tuition_fee', 'exam_fee', 'ac_charges', 'stationary_charges',
      'admission_fee', 'lab_charges', 'security_fee', 'misc'
    ];
    
    if (feeFields.includes(name)) {
      const updatedData = {
        ...formData,
        [name]: value
      };
      
      const total = calculateTotal(updatedData);
      
      setFormData({
        ...updatedData,
        total_fee: total
      });
    } else if (name === 'paid') {
      setFormData({
        ...formData,
        paid: e.target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // Get student ID from formData or originalData
      const studentId = formData.student || 
                       (originalData && originalData.student) || 
                       (formData.student_info && formData.student_info.roll_no);
      
      if (!studentId) {
        throw new Error("Student ID is required");
      }
      
      // Prepare data for submission - ensure it matches the required API format
      const dataToSubmit = {
        ...(isEditMode ? { id: id } : {}), // Include the ID in edit mode
        student: studentId, // The critical field
        month: formData.month,
        tuition_fee: formData.tuition_fee,
        exam_fee: formData.exam_fee,
        ac_charges: formData.ac_charges,
        stationary_charges: formData.stationary_charges,
        admission_fee: formData.admission_fee,
        lab_charges: formData.lab_charges,
        security_fee: formData.security_fee,
        misc: formData.misc,
        description: formData.description,
        total_fee: calculateTotal(formData),
        paid: formData.paid
      };
      
      // For debugging
      let endpoint;
      let response;
      
      if (isEditMode) {
        // Use the new dedicated endpoint for updates
        endpoint = `/api/feeupdate/${id}/`;
        response = await studentService.updateFeeViaEndpoint(id, dataToSubmit);
      } else {
        endpoint = '/api/studentfees/';
        response = await studentService.createStudentFee(dataToSubmit);
      }
      
      // Update debug info with new endpoint
      const debugData = {
        isEditMode,
        endpoint,
        studentId,
        dataToSubmit
      };
      
      setDebugInfo(debugData);
      console.log('Submitting data:', debugData);
      
      console.log('API Response:', response);
      navigate('/student-fees');
    } catch (err) {
      console.error('Error submitting form:', err);
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} fee record`;
      
      if (err.response) {
        const responseData = err.response.data;
        console.error('Server error response:', responseData);
        
        if (typeof responseData === 'object') {
          errorMessage += ': ' + Object.entries(responseData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else if (typeof responseData === 'string') {
          errorMessage += ': ' + responseData;
        }
      } else if (err.request) {
        errorMessage += ': No response received from server';
      } else {
        errorMessage += ': ' + err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.id) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }
  
  return (
    <div className="container mt-4">
      <h2>{isEditMode ? 'Edit Fee Record' : 'Add New Fee'}</h2>
      
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      
      {debugInfo && (
        <div className="alert alert-info mt-3">
          <details>
            <summary>Debug Information (click to expand)</summary>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Show student selection only in create mode */}
        {!isEditMode ? (
          <div className="mb-3">
            <label htmlFor="student" className="form-label">Student</label>
            <select
              className="form-select"
              id="student"
              name="student"
              value={selectedStudent}
              onChange={handleChange}
              required
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id || student.roll_no} value={student.id || student.roll_no}>
                  {student.name} - {student.class_name || student.grade} ({student.roll_no})
                </option>
              ))}
            </select>
          </div>
        ) : (
          /* In edit mode, show a hidden input with the student ID */
          <input 
            type="hidden" 
            name="student" 
            value={selectedStudent} 
          />
        )}
        
        {/* Display student info in edit mode */}
        {isEditMode && formData.student_info && (
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Student Name</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.student_info?.name || ''}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Roll No</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.student_info?.roll_no || ''}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Grade</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.student_info?.grade || ''}
                readOnly
              />
            </div>
          </div>
        )}
        
        {/* Month selection */}
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
        </div>
        
        {/* Fee fields - organized in rows of 2 */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="tuition_fee" className="form-label">Tuition Fee</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="tuition_fee"
                name="tuition_fee"
                value={formData.tuition_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="exam_fee" className="form-label">Exam Fee</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="exam_fee"
                name="exam_fee"
                value={formData.exam_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="ac_charges" className="form-label">AC Charges</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="ac_charges"
                name="ac_charges"
                value={formData.ac_charges}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="stationary_charges" className="form-label">Stationary Charges</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="stationary_charges"
                name="stationary_charges"
                value={formData.stationary_charges}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="admission_fee" className="form-label">Admission Fee</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="admission_fee"
                name="admission_fee"
                value={formData.admission_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="lab_charges" className="form-label">Lab Charges</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="lab_charges"
                name="lab_charges"
                value={formData.lab_charges}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="security_fee" className="form-label">Security Fee</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="security_fee"
                name="security_fee"
                value={formData.security_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="misc" className="form-label">Miscellaneous</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="misc"
                name="misc"
                value={formData.misc}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        
        {/* Description field */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        {/* Total fee (calculated automatically) */}
        <div className="mb-3">
          <label htmlFor="total_fee" className="form-label">Total Fee</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="text"
              className="form-control"
              id="total_fee"
              value={formData.total_fee}
              readOnly
            />
          </div>
        </div>
        
        {/* Paid checkbox */}
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="paid"
            name="paid"
            checked={formData.paid}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="paid">Paid</label>
        </div>
        
        {/* Save & Cancel buttons */}
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
            onClick={() => navigate('/student-fees')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentFeeForm;