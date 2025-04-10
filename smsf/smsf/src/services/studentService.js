import api from './api';

// Student API services
const studentService = {
  // Get all students
  getAllStudents: () => {
    return api.get('/api/students/');
  },
  
  // Get student by ID
  getStudent: (id) => {
    return api.get(`/api/students/${id}/`);
  },
  
  // Create new student - with support for file uploads
  createStudent: (studentData) => {
    // Check if studentData is FormData (for file uploads) or regular object
    if (studentData instanceof FormData) {
      return api.post('/api/students/', studentData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/api/students/', studentData);
  },
  
  
  updateStudent: (id, studentData) => {
    // Check if studentData is FormData (for file uploads) or regular object
    if (studentData instanceof FormData) {
      return api.patch(`/api/students/${id}/`, studentData);  // Let the browser set the content type
    }
    return api.patch(`/api/students/${id}/`, studentData);
  },
  
  // Delete student
  deleteStudent: (id) => {
    return api.delete(`/api/students/${id}/`);
  },
  
  // Get all student fees
  getAllStudentFees: () => {
    return api.get('/api/studentfees/');
  },
  
  // Get student fee by ID
  getStudentFee: (id) => {
    return api.get(`/api/studentfees/${id}/`);
  },
  
  // Create new student fee
  createStudentFee: (feeData) => {
    return api.post('/api/studentfees/', feeData);
  },
  
  // Update student fee
  updateStudentFee: (id, feeData) => {
    return api.put(`/api/studentfees/${id}/`, feeData);
  },
  
  // Delete student fee
  deleteStudentFee: (id) => {
    return api.delete(`/api/studentfees/${id}/`);
  },
  
  // Update fee via dedicated endpoint
  updateFeeViaEndpoint: (id, feeData) => {
    return api.put(`/api/feeupdate/${id}/`, feeData);
  },
  
  // Generate fees for enrolled students
  generateFees: (feeData) => {
    return api.post('/api/feegen/', feeData);
  }
};

export default studentService;