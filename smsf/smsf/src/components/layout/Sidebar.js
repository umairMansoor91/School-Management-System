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

  // Define menu structure to make it more maintainable
  const menuItems = [
    {
      section: "Main",
      items: [
        { path: "/", icon: "bi-speedometer2", label: "Dashboard" }
      ]
    },
    {
      section: "Teachers",
      items: [
        { path: "/teachers", icon: "bi-person-badge", label: "Teachers List" },
        { path: "/teacher-payments", icon: "bi-cash-coin", label: "Teacher Payments" }
      ]
    },
    {
      section: "Students",
      items: [
        { path: "/students", icon: "bi-people", label: "Students List" },
        { path: "/student-fees", icon: "bi-cash-stack", label: "Student Fees" }
      ]
    },
    {
      section: "Finance",
      items: [
        { path: "/expenses", icon: "bi-receipt", label: "Expenses" }
      ]
    }
  ];

  return (
    <div className={`sidebar bg-dark text-white ${collapsed ? 'collapsed' : ''}`} 
         style={{ 
           minHeight: '100vh', 
           width: collapsed ? '70px' : '250px',
           transition: 'all 0.3s ease-in-out',
           boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
         }}>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          {!collapsed ? (
            <h3 className="text-left mb-0 fw-bold">K - Wave</h3>
          ) : (
            <div className="text-center w-100 fs-4 fw-bold">KW</div>
          )}
          <button 
            className="btn btn-dark rounded-circle" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
        
        <hr className="bg-secondary" />
        
        <ul className="nav nav-pills flex-column gap-1">
          {menuItems.map((section, sectionIndex) => (
            <React.Fragment key={`section-${sectionIndex}`}>
              {/* Section header */}
              {!collapsed && (
                <li className="nav-item mt-3">
                  <h6 className="sidebar-heading px-3 mt-1 mb-2 text-uppercase text-muted small">
                    <span>{section.section}</span>
                  </h6>
                </li>
              )}
              {collapsed && sectionIndex > 0 && (
                <li className="nav-item">
                  <hr className="dropdown-divider my-2" />
                </li>
              )}
              
              {/* Section menu items */}
              {section.items.map((item, itemIndex) => (
                <li className="nav-item mb-1" key={`item-${sectionIndex}-${itemIndex}`}>
                  <Link 
                    to={item.path} 
                    className={`nav-link text-white rounded ${item.path === "/" 
                      ? location.pathname === "/" ? "active" : "" 
                      : isActive(item.path)}`}
                    title={item.label}
                  >
                    <i className={`bi ${item.icon} ${collapsed ? '' : 'me-2'}`}></i>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
      
      {/* User profile section at bottom */}
      <div className={`mt-auto p-3 border-top border-secondary ${collapsed ? 'text-center' : ''}`}>
        <Link to="/profile" className="text-decoration-none text-white d-flex align-items-center">
          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" 
               style={{width: '40px', height: '40px'}}>
            <i className="bi bi-person"></i>
          </div>
          {!collapsed && (
            <div className="ms-2">
              <div className="fw-semibold">Admin User</div>
              <small className="text-muted">View Profile</small>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;