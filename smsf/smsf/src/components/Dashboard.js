import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import ledgerService from '../services/ledgerService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [allLedgerData, setAllLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('3');

  useEffect(() => {
    // Fetch ledger data when component mounts
    const fetchLedgerData = async () => {
      try {
        const response = await ledgerService.getAllLedgers();
        
        const data = response.data;
        
        if (!data || data.length === 0) {
          throw new Error('No data received from server');
        }
        
        // Sort data by date (most recent first)
        const sortedData = [...data].sort((a, b) => {
          return new Date(b.month) - new Date(a.month);
        });
        
        // Set the most recent month as current ledger data
        setLedgerData(sortedData[0]);
        
        // Set all ledger data for the chart
        setAllLedgerData(sortedData);
        
        setError(null);
      } catch (error) {
        console.error('Error fetching ledger data:', error);
        
        // Use fallback data when in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback data for development');
          const fallbackData = [
            {
              "id": 4,
              "month": "2025-04-01",
              "MonthlyStudentFees": "00.00",
              "MonthlyTeacherPays": "90000.00",
              "MonthlyExpenses": "93000.00",
              "MonthlyProfit": "308000.00"
            },
            {
              "id": 5,
              "month": "2025-03-01",
              "MonthlyStudentFees": "350000.00",
              "MonthlyTeacherPays": "35000.00",
              "MonthlyExpenses": "10000.00",
              "MonthlyProfit": "100000.00"
            },
            {
              "id": 6,
              "month": "2025-02-01",
              "MonthlyStudentFees": "250000.00",
              "MonthlyTeacherPays": "90000.00",
              "MonthlyExpenses": "10000.00",
              "MonthlyProfit": "350000.00"
            },
            {
              "id": 7,
              "month": "2025-01-01",
              "MonthlyStudentFees": "350000.00",
              "MonthlyTeacherPays": "10000.00",
              "MonthlyExpenses": "25000.00",
              "MonthlyProfit": "150000.00"
            }
          ];
          
          setLedgerData(fallbackData[0]);
          setAllLedgerData(fallbackData);
          
          // Clear error when using fallback data
          setError(null);
        } else {
          // Only set error in production or if fallback data isn't used
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLedgerData();
  }, []);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format the month string properly
  const formatMonthYear = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Split the date string (assuming YYYY-MM-DD format)
      const parts = dateString.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1; // Convert to 0-based index
        
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthNames[monthIndex]} ${year}`;
        }
      }
      
      // If parsing fails, return the original string
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Calculate financial health percentage
  const getFinancialHealth = () => {
    if (!ledgerData) return 0;
    
    const revenue = parseFloat(ledgerData.MonthlyStudentFees);
    const expenses = parseFloat(ledgerData.MonthlyTeacherPays) + parseFloat(ledgerData.MonthlyExpenses);
    
    // If revenue is 0, prevent division by zero
    if (revenue === 0) return 0;
    
    // Calculate profit margin percentage
    const profitMargin = ((revenue - expenses) / revenue) * 100;
    
    return Math.min(Math.max(profitMargin, 0), 100); // Clamp between 0 and 100
  };

  const getHealthVariant = (health) => {
    if (health >= 80) return 'success';
    if (health >= 50) return 'info';
    if (health >= 25) return 'warning';
    return 'danger';
  };

  // Calculate profit margin
  const getProfitMargin = () => {
    if (!ledgerData) return 0;
    
    const revenue = parseFloat(ledgerData.MonthlyStudentFees);
    const expenses = parseFloat(ledgerData.MonthlyTeacherPays) + parseFloat(ledgerData.MonthlyExpenses);
    
    if (revenue === 0) return 0;
    
    return ((revenue - expenses) / revenue * 100).toFixed(1);
  };

  // Calculate revenue to expense ratio
  const getRevenueExpenseRatio = () => {
    if (!ledgerData) return 0;
    
    const revenue = parseFloat(ledgerData.MonthlyStudentFees);
    const expenses = parseFloat(ledgerData.MonthlyTeacherPays) + parseFloat(ledgerData.MonthlyExpenses);
    
    if (expenses === 0) return "N/A";
    
    return (revenue / expenses).toFixed(2);
  };

  // Get change percentage from previous month
  const getChangePercentage = (current, previous, field) => {
    if (!current || !previous) return 0;
    
    const currentValue = parseFloat(current[field]);
    const previousValue = parseFloat(previous[field]);
    
    if (previousValue === 0) return 0;
    
    return ((currentValue - previousValue) / previousValue * 100).toFixed(1);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!allLedgerData || allLedgerData.length === 0) return [];
    
    // Filter based on selected timeframe
    const monthsToShow = parseInt(chartTimeframe, 10);
    const filteredData = allLedgerData.slice(0, monthsToShow).reverse();
    
    return filteredData.map(item => ({
      month: formatMonthYear(item.month).split(' ')[0], // Just get the month name
      Revenue: parseFloat(item.MonthlyStudentFees),
      Expenses: parseFloat(item.MonthlyTeacherPays) + parseFloat(item.MonthlyExpenses),
      Profit: parseFloat(item.MonthlyProfit)
    }));
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <div>
          <span className="me-2">Current Period: </span>
          <Badge bg="primary" className="p-2">
            {loading ? 'Loading...' : (ledgerData ? formatMonthYear(ledgerData.month) : 'N/A')}
          </Badge>
        </div>
      </div>
      
      {/* KPI Cards */}
      {!loading && ledgerData && (
        <Row className="g-3 mb-4">
          <Col lg={3} sm={6}>
            <Card className="h-100 shadow-sm border-0 bg-gradient">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Revenue</h6>
                    <h3 className="mb-0">{formatCurrency(ledgerData.MonthlyStudentFees)}</h3>
                    {allLedgerData.length > 1 && (
                      <div className={`text-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyStudentFees')) >= 0 ? 'success' : 'danger'} mt-2`}>
                        <small>
                          <i className={`bi bi-arrow-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyStudentFees')) >= 0 ? 'up' : 'down'}-right me-1`}></i>
                          {Math.abs(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyStudentFees'))}% from last month
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-cash-stack text-success fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} sm={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Teacher Payments</h6>
                    <h3 className="mb-0">{formatCurrency(ledgerData.MonthlyTeacherPays)}</h3>
                    {allLedgerData.length > 1 && (
                      <div className={`text-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyTeacherPays')) >= 0 ? 'primary' : 'success'} mt-2`}>
                        <small>
                          <i className={`bi bi-arrow-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyTeacherPays')) >= 0 ? 'up' : 'down'}-right me-1`}></i>
                          {Math.abs(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyTeacherPays'))}% from last month
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-wallet2 text-primary fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} sm={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Expenses</h6>
                    <h3 className="mb-0">{formatCurrency(ledgerData.MonthlyExpenses)}</h3>
                    {allLedgerData.length > 1 && (
                      <div className={`text-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyExpenses')) >= 0 ? 'danger' : 'success'} mt-2`}>
                        <small>
                          <i className={`bi bi-arrow-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyExpenses')) >= 0 ? 'up' : 'down'}-right me-1`}></i>
                          {Math.abs(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyExpenses'))}% from last month
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="rounded-circle bg-danger bg-opacity-10 p-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-credit-card text-danger fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} sm={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Profit</h6>
                    <h3 className="mb-0">{formatCurrency(ledgerData.MonthlyProfit)}</h3>
                    {allLedgerData.length > 1 && (
                      <div className={`text-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyProfit')) >= 0 ? 'success' : 'danger'} mt-2`}>
                        <small>
                          <i className={`bi bi-arrow-${parseFloat(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyProfit')) >= 0 ? 'up' : 'down'}-right me-1`}></i>
                          {Math.abs(getChangePercentage(allLedgerData[0], allLedgerData[1], 'MonthlyProfit'))}% from last month
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-graph-up-arrow text-warning fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Main Content Area */}
      <Row className="g-3">
        {/* Quick Actions */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4 border-0">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4} className="mb-3">
                  <Card className="h-100 shadow-sm border-primary border-top border-3 text-center">
                    <Card.Body>
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                        <i className="bi bi-person-badge text-primary fs-3"></i>
                      </div>
                      <Card.Title className="fs-5">Teachers</Card.Title>
                      <Card.Text className="small text-muted">Manage teacher information and payments</Card.Text>
                      <a href="/teachers" className="btn btn-sm btn-outline-primary">View Teachers</a>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Card className="h-100 shadow-sm border-success border-top border-3 text-center">
                    <Card.Body>
                      <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-flex mb-3">
                        <i className="bi bi-people text-success fs-3"></i>
                      </div>
                      <Card.Title className="fs-5">Students</Card.Title>
                      <Card.Text className="small text-muted">Manage student information and fees</Card.Text>
                      <a href="/students" className="btn btn-sm btn-outline-success">View Students</a>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Card className="h-100 shadow-sm border-danger border-top border-3 text-center">
                    <Card.Body>
                      <div className="rounded-circle bg-danger bg-opacity-10 p-3 d-inline-flex mb-3">
                        <i className="bi bi-receipt text-danger fs-3"></i>
                      </div>
                      <Card.Title className="fs-5">Expenses</Card.Title>
                      <Card.Text className="small text-muted">Track and manage school expenses</Card.Text>
                      <a href="/expenses" className="btn btn-sm btn-outline-danger">View Expenses</a>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Performance Chart */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">Financial Performance</h5>
              <div>
                <select 
                  className="form-select form-select-sm"
                  value={chartTimeframe}
                  onChange={(e) => setChartTimeframe(e.target.value)}
                >
                  <option value="3">Last 3 Months</option>
                  <option value="6">Last 6 Months</option>
                  <option value="12">This Year</option>
                </select>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : allLedgerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={prepareChartData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="Revenue" stroke="#28a745" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="Expenses" stroke="#dc3545" strokeWidth={2} />
                    <Line type="monotone" dataKey="Profit" stroke="#ffc107" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-placeholder p-4 bg-light rounded text-center">
                  <i className="bi bi-bar-chart-line fs-1 text-muted my-4 d-block"></i>
                  <p className="text-muted">No financial data available for visualization</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Side panel */}
        <Col lg={4}>
          {/* Financial Health */}
          <Card className="shadow-sm mb-4 border-0">
            <Card.Header className="bg-transparent border-0 py-3">
              <h5 className="mb-0">Financial Health</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : ledgerData ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Health Score</h6>
                    <Badge bg={getHealthVariant(getFinancialHealth())}>
                      {Math.round(getFinancialHealth())}%
                    </Badge>
                  </div>
                  <ProgressBar 
                    variant={getHealthVariant(getFinancialHealth())} 
                    now={getFinancialHealth()} 
                    className="mb-4"
                  />
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <div>Revenue to Expense Ratio</div>
                    <div className="fw-bold">{getRevenueExpenseRatio()}</div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <div>Profit Margin</div>
                    <div className="fw-bold">{getProfitMargin()}%</div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <div>Cash Flow</div>
                    <div className="fw-bold">Positive</div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted py-3">No financial data available</p>
              )}
            </Card.Body>
          </Card>
          
          {/* Recent Activity */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-transparent border-0 py-3">
              <h5 className="mb-0">To Do List</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item border-0 py-3">
                  <div className="d-flex">
                    <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                      <i className="bi bi-check-circle text-success"></i>
                    </div>
                    <div>
                      <p className="mb-0 fw-medium">Student fee Generation</p>
                      <small className="text-muted">24th of each month</small>
                    </div>
                  </div>
                </li>
                <li className="list-group-item border-0 py-3">
                  <div className="d-flex">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <i className="bi bi-wallet2 text-primary"></i>
                    </div>
                    <div>
                      <p className="mb-0 fw-medium">Teacher salaries</p>
                      <small className="text-muted">5th of each month</small>
                    </div>
                  </div>
                </li>
                <li className="list-group-item border-0 py-3">
                  <div className="d-flex">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                      <i className="bi bi-person-plus text-warning"></i>
                    </div>
                    <div>
                      <p className="mb-0 fw-medium">Utility bills</p>
                      <small className="text-muted">5th of each month</small>
                    </div>
                  </div>
                </li>
                <li className="list-group-item border-0 py-3">
                  <div className="d-flex">
                    <div className="rounded-circle bg-danger bg-opacity-10 p-2 me-3">
                      <i className="bi bi-receipt text-danger"></i>
                    </div>
                    <div>
                      <p className="mb-0 fw-medium">New student and teacher enrollment</p>
                      <small className="text-muted">On Selection</small>
                    </div>
                  </div>
                </li>
              </ul>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <a href="/activity" className="btn btn-sm btn-link text-decoration-none d-block">View All Activity</a>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;