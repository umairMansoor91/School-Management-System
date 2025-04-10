import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="d-flex flex-column flex-md-row vh-100 overflow-hidden">
      {/* Mobile header with menu toggle */}
      <div className="d-md-none bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <h3 className="m-0">K - Wave</h3>
        <button 
          className="btn btn-link text-white" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`d-md-block ${mobileMenuOpen ? 'd-block' : 'd-none'}`}>
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-grow-1 bg-light overflow-auto">
        <div className="container-fluid px-md-4 py-4">
          <header className="bg-white p-3 mb-4 shadow-sm rounded d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Knowledge Wave School System</h4>
            <div>
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-bell me-2"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    2
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><span className="dropdown-item-text"><small className="text-muted">Notifications</small></span></li>
                  <li><a className="dropdown-item" href="#"><i className="bi bi-exclamation-circle-fill text-warning me-2"></i> Fee payment reminder</a></li>
                  <li><a className="dropdown-item" href="#"><i className="bi bi-info-circle-fill text-info me-2"></i> New expense report</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item text-center" href="#"><small>View all notifications</small></a></li>
                </ul>
              </div>
            </div>
          </header>
          
          <main>
            {children}
          </main>
          
          <footer className="mt-4 text-center text-muted">
            <p><small>Knowledge Wave School System &copy; {new Date().getFullYear()}</small></p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;