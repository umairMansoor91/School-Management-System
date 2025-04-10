import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import { jsPDF } from 'jspdf';

const StudentFeeList = () => {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique months from fees for filter dropdown
  const getUniqueMonths = () => {
    const monthsSet = new Set();
    fees.forEach(fee => {
      const monthYear = formatDate(fee.month);
      monthsSet.add(monthYear);
    });
    return Array.from(monthsSet);
  };

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await studentService.getAllStudentFees();
        setFees(response.data);
        setFilteredFees(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch student fees');
        setLoading(false);
        console.error('Error fetching student fees:', err);
      }
    };

    fetchFees();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    let result = fees;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isPaid = statusFilter === 'paid';
      result = result.filter(fee => fee.paid === isPaid);
    }
    
    // Apply month filter
    if (monthFilter !== 'all') {
      result = result.filter(fee => formatDate(fee.month) === monthFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(fee => 
        fee.student_info.name.toLowerCase().includes(term) ||
        String(fee.student_info.roll_no).toLowerCase().includes(term) ||
        String(fee.student_info.grade).toLowerCase().includes(term)
      );
    }
    
    setFilteredFees(result);
    // Reset selections when filters change
    setSelectedFees([]);
    setSelectAll(false);
  }, [fees, statusFilter, monthFilter, searchTerm]);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      // Select all currently filtered fees
      setSelectedFees(filteredFees.map(fee => fee.id));
    } else {
      // Deselect all
      setSelectedFees([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelect = (id) => {
    if (selectedFees.includes(id)) {
      setSelectedFees(selectedFees.filter(feeId => feeId !== id));
      setSelectAll(false);
    } else {
      setSelectedFees([...selectedFees, id]);
      // Check if all are selected
      if (selectedFees.length + 1 === filteredFees.length) {
        setSelectAll(true);
      }
    }
  };

  const handleEdit = (feeId) => {
    // Navigate to the edit page for the specified fee ID
    window.location.href = `/student-fees/edit/${feeId}`;
  };

  

  // Handle deleting a fee record
  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee record? This action cannot be undone.')) {
      try {
        // Call API to delete the record
        await studentService.deleteStudentFee(feeId);
        
        // Update state to remove the deleted record
        setFees(fees.filter(fee => fee.id !== feeId));
        setFilteredFees(filteredFees.filter(fee => fee.id !== feeId));
        
        // Also remove from selected fees if present
        if (selectedFees.includes(feeId)) {
          setSelectedFees(selectedFees.filter(id => id !== feeId));
        }
        
        // Show success message
        alert('Fee record deleted successfully');
      } catch (err) {
        setError('Failed to delete fee record');
        console.error('Error deleting fee record:', err);
      }
    }
  };

  // Function to generate and download fee challan as PDF
const generateFeeChallan = (fee) => {
  try {
    const currentDate = new Date().toLocaleDateString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10); // 10 days from now
    const formattedDueDate = dueDate.toLocaleDateString();
    
    // Create new PDF document - landscape mode for better column layout
    const doc = new jsPDF('landscape');
    
    // Create fee items array with only non-zero fees
    const feeItems = [];
    if (parseFloat(fee.tuition_fee) > 0) feeItems.push(['Tuition Fee', `${parseFloat(fee.tuition_fee).toFixed(2)}`]);
    if (parseFloat(fee.exam_fee) > 0) feeItems.push(['Exam Fee', `${parseFloat(fee.exam_fee).toFixed(2)}`]);
    if (parseFloat(fee.ac_charges) > 0) feeItems.push(['AC Charges', `${parseFloat(fee.ac_charges).toFixed(2)}`]);
    if (parseFloat(fee.stationary_charges) > 0) feeItems.push(['Stationary Charges', `${parseFloat(fee.stationary_charges).toFixed(2)}`]);
    if (parseFloat(fee.admission_fee) > 0) feeItems.push(['Admission Fee', `${parseFloat(fee.admission_fee).toFixed(2)}`]);
    if (parseFloat(fee.lab_charges) > 0) feeItems.push(['Lab Charges', `${parseFloat(fee.lab_charges).toFixed(2)}`]);
    if (parseFloat(fee.security_fee) > 0) feeItems.push(['Security (Refundable)', `${parseFloat(fee.security_fee).toFixed(2)}`]);
    if (parseFloat(fee.misc) > 0) feeItems.push(['Miscellaneous', `${parseFloat(fee.misc).toFixed(2)}`]);
    
    // Define column dimensions for side-by-side layout
    const columns = [
      { x: 10, width: 90, title: 'BANK' },
      { x: 105, width: 90, title: 'SCHOOL' },
      { x: 200, width: 90, title: 'STUDENT' }
    ];
    
    // Get base64 image data - Preload image to ensure it's available for all copies
    // You need to fetch the logo only once before creating copies
    const logoImg = new Image();
    logoImg.src = '/images/logo.png'; // Path to your logo in public folder
    
    // Helper function to create challan copy
    const createChallanCopy = (column, copyTitle) => {
      const xStart = column.x;
      const colWidth = column.width;
      const yStart = 15;
      
      // Draw border around the challan
      doc.setDrawColor(0);
      doc.rect(xStart, yStart, colWidth, 180);
      
      // Create vertical divider line between copies
      if (column.x < 200) {
        doc.setDrawColor(0);
        doc.setLineDashPattern([3, 3], 0);
        doc.line(xStart + colWidth + 5, yStart, xStart + colWidth + 5, yStart + 180);
        doc.text('✂', xStart + colWidth + 2, yStart + 90);
        doc.setLineDashPattern([], 0);
      }
      
      // Add logo - centered at the top
      const logoWidth = 15; // Adjust based on your logo dimensions
      const logoHeight = 15; // Adjust based on your logo dimensions
      const logoX = xStart + (colWidth/2) - (logoWidth/2);
      const logoY = yStart + 5;
      
      try {
        doc.addImage('/images/logo.png', 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (imgErr) {
        console.error('Error adding logo:', imgErr);
        // Continue without logo if there's an error
      }
      
      // Header - moved down to account for logo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('KNOWLEDGE WAVE', xStart + colWidth/2, yStart + logoHeight + 10, { align: 'center' });
      doc.setFontSize(10);
      doc.text('FEE CHALLAN', xStart + colWidth/2, yStart + logoHeight + 16, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`For the month of ${formatDate(fee.month)}`, xStart + colWidth/2, yStart + logoHeight + 21, { align: 'center' });
      
      // Copy label
      doc.setFontSize(9);
      doc.text(`${copyTitle} COPY`, xStart + 5, yStart + logoHeight + 28);
      
      // Student info - adjusted positioning
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Challan No: ${fee.id}`, xStart + 5, yStart + logoHeight + 36);
      doc.text(`Issue Date: ${currentDate}`, xStart + colWidth - 30, yStart + logoHeight + 36);
      doc.text(`Student Name: ${fee.student_info.name}`, xStart + 5, yStart + logoHeight + 41);
      doc.text(`Roll No: ${fee.student_info.roll_no}`, xStart + colWidth - 30, yStart + logoHeight + 41);
      doc.text(`Grade: ${fee.student_info.grade}`, xStart + 5, yStart + logoHeight + 46);
      doc.text(`Due Date: ${formattedDueDate}`, xStart + colWidth - 30, yStart + logoHeight + 46);
      
      // Draw fee table manually - adjusted positioning
      let tableY = yStart + logoHeight + 51;
      const lineHeight = 7;
      const tableWidth = colWidth - 10;
      const col1X = xStart + 5;
      const col2X = xStart + colWidth - 20;
      
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(220, 220, 220);
      doc.rect(col1X, tableY, tableWidth, lineHeight, 'F');
      doc.text('Description', col1X + 2, tableY + 5);
      doc.text('Amount', col2X, tableY + 5);
      tableY += lineHeight;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      feeItems.forEach((item) => {
        doc.rect(col1X, tableY, tableWidth, lineHeight);
        doc.text(item[0], col1X + 2, tableY + 5);
        doc.text(item[1], col2X, tableY + 5);
        tableY += lineHeight;
      });
      
      // Total row
      doc.setFont('helvetica', 'bold');
      doc.rect(col1X, tableY, tableWidth, lineHeight, 'S');
      doc.text('Total', col1X + 2, tableY + 5);
      doc.text(`${parseFloat(fee.total_fee).toFixed(2)}`, col2X, tableY + 5);
      tableY += lineHeight + 5;
      
      // Add description if available
      if (fee.description && fee.description !== "na") {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`Note: ${fee.description}`, xStart + 5, tableY + 5, {
          maxWidth: colWidth - 10
        });
        tableY += 10;
      }
      
      // Signature lines
      tableY += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.line(xStart + 5, tableY, xStart + 35, tableY); // Bank signature line
      doc.line(xStart + colWidth - 40, tableY, xStart + colWidth - 5, tableY); // School signature line
      doc.text('Bank Signature', xStart + 5, tableY + 5);
      doc.text('School Signature', xStart + colWidth - 40, tableY + 5);
    };
    
    // Create three copies side by side
    columns.forEach(column => {
      createChallanCopy(column, column.title);
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 200);
    doc.text('Knowledge Wave School Management System', 292, 200, { align: 'right' });
    
    // Save the PDF
    doc.save(`Fee_Challan_${fee.student_info.name.replace(/\s+/g, '_')}_${fee.id}.pdf`);
  } catch (err) {
    console.error('PDF generation error:', err);
    setError('Error generating PDF: ' + err.message);
  }
};

  // Function to generate multiple fee challans
  const generateMultipleChallans = () => {
    if (selectedFees.length === 0) {
      setError('Please select at least one student');
      return;
    }

    const selectedFeeRecords = fees.filter(fee => selectedFees.includes(fee.id));
    
    if (window.confirm(`Are you sure you want to generate ${selectedFeeRecords.length} fee challan(s)?`)) {
      try {
        // Generate challan for each selected fee
        selectedFeeRecords.forEach(fee => {
          generateFeeChallan(fee);
        });
      } catch (err) {
        setError('Failed to generate multiple fee challans');
        console.error('Error generating multiple fee challans:', err);
      }
    }
  };

  // Function for generating single fee challan
  const handleGenerateFee = async (fee) => {
    try {
      if (window.confirm('Are you sure you want to generate fee challan for this student?')) {
        generateFeeChallan(fee);
      }
    } catch (err) {
      setError('Failed to generate fee challan');
      console.error('Error generating fee challan:', err);
    }
  };

  // Function to format date from YYYY-MM-DD to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Calculate total fees paid and pending
  const calculateStats = () => {
    const totalFees = filteredFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee), 0);
    const paidFees = filteredFees.filter(fee => fee.paid).reduce((sum, fee) => sum + parseFloat(fee.total_fee), 0);
    const pendingFees = totalFees - paidFees;
    
    return { totalFees, paidFees, pendingFees };
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setMonthFilter('all');
    setSearchTerm('');
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  const { totalFees, paidFees, pendingFees } = calculateStats();
  const uniqueMonths = getUniqueMonths();

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Fees</h2>
        <div className="d-flex gap-2">
          {selectedFees.length > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={generateMultipleChallans}
            >
              Generate {selectedFees.length} Challan(s)
            </button>
          )}
          <button 
            className="btn btn-success" 
            onClick={() => window.location.href = '/admin/student-fees/add'}
          >
            Dashboard
          </button>
        </div>
      </div>
      
      {/* Fee summary statistics */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title">Total Fees</h5>
              <p className="card-text fw-bold">Rs.{totalFees.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Paid</h5>
              <p className="card-text fw-bold">Rs.{paidFees.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="card-text fw-bold">Rs.{pendingFees.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filters</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Payment Status</label>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Month</label>
              <select 
                className="form-select" 
                value={monthFilter} 
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="all">All Months</option>
                {uniqueMonths.map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Search Student</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by name, roll no, grade..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-secondary w-100" 
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {filteredFees.length === 0 ? (
        <div className="alert alert-info">No fee records found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={selectAll} 
                      onChange={handleSelectAll} 
                      id="selectAllCheckbox" 
                    />
                    <label className="form-check-label" htmlFor="selectAllCheckbox">
                      All
                    </label>
                  </div>
                </th>
                <th>ID</th>
                <th>Student</th>
                <th>Roll_No</th>
                <th>Grade</th>
                <th>Month</th>
                <th>Tuition</th>
                <th>Exam</th>
                <th>AC</th>
                <th>Stationary</th>
                <th>Admission</th>
                <th>Lab</th>
                <th>Security</th>
                <th>Misc</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => (
                <tr key={fee.id}>
                  <td>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={selectedFees.includes(fee.id)} 
                        onChange={() => handleSelect(fee.id)} 
                        id={`checkbox-${fee.id}`} 
                      />
                    </div>
                  </td>
                  <td>{fee.id}</td>
                  <td>{fee.student_info.name}</td>
                  <td>{fee.student_info.roll_no}</td>
                  <td>{fee.student_info.grade}</td>
                  <td>{formatDate(fee.month)}</td>
                  <td>{parseFloat(fee.tuition_fee).toFixed(2)}</td>
                  <td>{parseFloat(fee.exam_fee).toFixed(2)}</td>
                  <td>{parseFloat(fee.ac_charges).toFixed(2)}</td>
                  <td>{parseFloat(fee.stationary_charges).toFixed(2)}</td>
                  <td>{parseFloat(fee.admission_fee).toFixed(2)}</td>
                  <td>{parseFloat(fee.lab_charges).toFixed(2)}</td>
                  <td>{parseFloat(fee.security_fee).toFixed(2)}</td>
                  <td>{parseFloat(fee.misc).toFixed(2)}</td>
                  <td>{parseFloat(fee.total_fee).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${fee.paid ? 'bg-success' : 'bg-warning'}`}>
                      {fee.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" id={`dropdown-${fee.id}`} data-bs-toggle="dropdown" aria-expanded="false">
                        Actions
                      </button>
                      <ul className="dropdown-menu" aria-labelledby={`dropdown-${fee.id}`}>
                        <li>
                          <button className="dropdown-item" onClick={() => handleGenerateFee(fee)}>
                            <i className="bi bi-file-pdf me-2"></i> Generate Challan
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => handleEdit(fee.id)}>
                            <i className="bi bi-pencil me-2"></i> Edit
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={() => handleDelete(fee.id)}>
                            <i className="bi bi-trash me-2"></i> Delete
                          </button>
                        </li>
                      </ul>
                    </div>
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

export default StudentFeeList;