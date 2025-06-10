import api from './api';

// Teacher API services
const teacherService = {
  // Get all teachers
  getAllTeachers: () => {
    return api.get('/api/teacher/');
  },
  
  // Get teacher by ID
  getTeacher: (id) => {
    return api.get(`/api/teacher/${id}/`);
  },
  
  // Create new teacher
  createTeacher: (teacherData) => {
    return api.post('/api/teacher/', teacherData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Update teacher
  updateTeacher: (id, teacherData) => {
    return api.put(`/api/teacher/${id}/`, teacherData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Delete teacher
  deleteTeacher: (id) => {
    return api.delete(`/api/teacher/${id}/`);
  },
  
  // Get all teacher payments
  getAllTeacherPayments: () => {
    return api.get('/api/teacherpay/');
  },
  
  // Get teacher payment by ID
  getTeacherPayment: (id) => {
    return api.get(`/api/teacherpay/${id}/`);
  },
  
  // Create new teacher payment
  createTeacherPayment: (paymentData) => {
    return api.post('/api/teacherpay/', paymentData);
  },
  
  // Update teacher payment
  updateTeacherPayment: (id, paymentData) => {
    return api.put(`/api/teacherpay/${id}/`, paymentData);
  },
  
  // Delete teacher payment
  deleteTeacherPayment: (id) => {
    return api.delete(`/api/teacherpay/${id}/`);
  },
  
  // Get all generated teacher payments
  getAllGenTeacherPayments: () => {
    return api.get('/api/genteacherpay/');
  },
  
  // Get generated teacher payment by ID
  getGenTeacherPayment: (id) => {
    return api.get(`/api/genteacherpay/${id}/`);
  },
  
  // Create new generated teacher payment
  createGenTeacherPayment: (paymentData) => {
    return api.post('/api/genteacherpay/', paymentData);
  },
  
  // Update generated teacher payment
  updateGenTeacherPayment: (id, paymentData) => {
    return api.put(`/api/genteacherpay/${id}/`, paymentData);
  },
  
  // Delete generated teacher payment
  deleteGenTeacherPayment: (id) => {
    return api.delete(`/api/genteacherpay/${id}/`);
  }
};

export default teacherService;