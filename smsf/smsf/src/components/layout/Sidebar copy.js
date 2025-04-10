import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar bg-dark text-white ${collapsed ? 'collapsed' : ''}`} 
         style={{ 
           minHeight: '100vh', 
           width: collapsed ? '70px' : '250px',
           transition: 'width 0.3s ease-in-out'
         }}>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          {!collapsed && <h3 className="text-left mb-0">K - Wave</h3>}
          {collapsed && <div className="text-center w-100 fs-4">KW</div>}
          <button 
            className="btn btn-link text-white p-0" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
        
        <hr />
        
        <ul className="nav nav-pills flex-column">
          <li className="nav-item mb-2">
            <Link 
              to="/" 
              className={`nav-link text-white ${location.pathname === '/' ? 'active' : ''}`}
              title="Dashboard"
            >
              <i className="bi bi-speedometer2 me-2"></i>
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </li>
          
          {!collapsed && (
            <li className="nav-item mt-3">
              <h6 className="sidebar-heading px-3 mt-1 mb-1 text-muted">
                <span>Teachers</span>
              </h6>
            </li>
          )}
          {collapsed && <li className="nav-item"><hr className="dropdown-divider" /></li>}
          
          <li className="nav-item mb-2">
            <Link 
              to="/teachers" 
              className={`nav-link text-white ${isActive('/teachers')}`}
              title="Teachers List"
            >
              <i className="bi bi-person-badge me-2"></i>
              {!collapsed && <span>Teachers List</span>}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link 
              to="/teacher-payments" 
              className={`nav-link text-white ${isActive('/teacher-payments')}`}
              title="Teacher Payments"
            >
              <i className="bi bi-cash-coin me-2"></i>
              {!collapsed && <span>Teacher Payments</span>}
            </Link>
          </li>
          
          {!collapsed && (
            <li className="nav-item mt-3">
              <h6 className="sidebar-heading px-3 mt-1 mb-1 text-muted">
                <span>Students</span>
              </h6>
            </li>
          )}
          {collapsed && <li className="nav-item"><hr className="dropdown-divider" /></li>}
          
          <li className="nav-item mb-2">
            <Link 
              to="/students" 
              className={`nav-link text-white ${isActive('/students')}`}
              title="Students List"
            >
              <i className="bi bi-people me-2"></i>
              {!collapsed && <span>Students List</span>}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link 
              to="/student-fees" 
              className={`nav-link text-white ${isActive('/student-fees')}`}
              title="Student Fees"
            >
              <i className="bi bi-cash-stack me-2"></i>
              {!collapsed && <span>Student Fees</span>}
            </Link>
          </li>
          
          {!collapsed && (
            <li className="nav-item mt-3">
              <h6 className="sidebar-heading px-3 mt-1 mb-1 text-muted">
                <span>Expenses</span>
              </h6>
            </li>
          )}
          {collapsed && <li className="nav-item"><hr className="dropdown-divider" /></li>}
          
          <li className="nav-item mb-2">
            <Link 
              to="/expenses" 
              className={`nav-link text-white ${isActive('/expenses')}`}
              title="Expenses"
            >
              <i className="bi bi-receipt me-2"></i>
              {!collapsed && <span>Expenses</span>}
            </Link>
          </li>
          
          {!collapsed && (
            <li className="nav-item mt-3">
              <h6 className="sidebar-heading px-3 mt-1 mb-1 text-muted">
                <span>Reports</span>
              </h6>
            </li>
          )}
          {collapsed && <li className="nav-item"><hr className="dropdown-divider" /></li>}
          
          <li className="nav-item mb-2">
            <Link 
              to="/reports" 
              className={`nav-link text-white ${isActive('/reports')}`}
              title="Reports"
            >
              <i className="bi bi-bar-chart me-2"></i>
              {!collapsed && <span>Reports</span>}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link 
              to="/ledger" 
              className={`nav-link text-white ${isActive('/ledger')}`}
              title="Ledger"
            >
              <i className="bi bi-journal-text me-2"></i>
              {!collapsed && <span>Ledger</span>}
            </Link>
          </li>
        </ul>
      </div>
      
      
    </div>
  );
};

export default Sidebar;