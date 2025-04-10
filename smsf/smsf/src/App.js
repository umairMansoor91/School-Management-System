import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Layout
import Layout from './components/layout/Layout';

// Dashboard
import Dashboard from './components/Dashboard';

// Teacher Components
import TeacherList from './components/teachers/TeacherList';
import TeacherForm from './components/teachers/TeacherForm';
import TeacherPaymentList from './components/teachers/TeacherPaymentList';
import TeacherPaymentForm from './components/teachers/TeacherPaymentForm';
import GenTeacherPayment from './components/teachers/GenTeacherPayment';

// Student Components
import StudentList from './components/students/StudentList';
import StudentForm from './components/students/StudentForm';
import StudentFeeList from './components/students/StudentFeeList';
import StudentFeeForm from './components/students/StudentFeeForm';

// Expense Components
import ExpenseList from './components/expenses/ExpenseList';
import ExpenseForm from './components/expenses/ExpenseForm';

function App() {
  return (
    <Router>
      <Layout>
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Teacher Routes */}
          <Route path="/teachers" element={<TeacherList />} />
          <Route path="/teachers/new" element={<TeacherForm />} />
          <Route path="/teachers/edit/:id" element={<TeacherForm />} />
          
          <Route path="/teacher-payments" element={<TeacherPaymentList />} />
          <Route path="/teacher-payments/new" element={<TeacherPaymentForm />} />
          <Route path="/teacher-payments/edit/:id" element={<TeacherPaymentForm />} />
          
          <Route path="/generate-teacher-payments" element={<GenTeacherPayment />} />
          
          {/* Student Routes */}
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/edit/:id" element={<StudentForm />} />
          
          <Route path="/student-fees" element={<StudentFeeList />} />
          <Route path="/student-fees/new" element={<StudentFeeForm />} />
          <Route path="/student-fees/edit/:id" element={<StudentFeeForm />} />
          
          {/* Expense Routes */}
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/expenses/new" element={<ExpenseForm />} />
          <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
          
          {/* Redirect for any unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
