# School Management System - React Frontend

This is a React frontend application for a School Management System that connects to a Django backend with DRF APIs.

## Features

- **Teachers Module**: Manage teachers and their payment records
- **Students Module**: Manage students and their fee records
- **Expenses Module**: Track and manage school expenses
- **Dashboard**: Overview of all modules with quick access links

## Project Structure

```
school-management-system/
├── public/                  # Public assets
├── src/
│   ├── components/          # React components
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   ├── teachers/        # Teacher module components
│   │   ├── students/        # Student module components
│   │   ├── expenses/        # Expense module components
│   │   └── Dashboard.js     # Dashboard component
│   ├── services/            # API service files
│   │   ├── api.js           # Base API configuration
│   │   ├── teacherService.js # Teacher API services
│   │   ├── studentService.js # Student API services
│   │   └── expenseService.js # Expense API services
│   ├── utils/               # Utility functions
│   │   └── withApiIntegration.js # HOC for API integration
│   ├── App.js               # Main App component with routing
│   ├── index.js             # Entry point
│   ├── index.css            # Global styles
│   └── config.js            # Application configuration
├── TESTING.md               # Testing guide
├── todo.md                  # Development checklist
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Django backend running on http://localhost:8000 (or update the BASE_URL in config.js)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open http://localhost:3000 in your browser

## API Integration

The application connects to a Django backend with the following API endpoints:

### Teachers
- GET/POST `/api/teacher/` - List and create teachers
- GET/PUT/DELETE `/api/teacher/<id>/` - Retrieve, update, delete teacher
- GET/POST `/api/teacherpay/` - List and create teacher payments
- GET/PUT/DELETE `/api/teacherpay/<id>/` - Retrieve, update, delete teacher payment
- GET/POST `/api/genteacherpay/` - List and create generated teacher payments
- GET/PUT/DELETE `/api/genteacherpay/<id>/` - Retrieve, update, delete generated teacher payment

### Students
- GET/POST `/api/students/` - List and create students
- GET/PUT/DELETE `/api/students/<id>/` - Retrieve, update, delete student
- GET/POST `/api/studentfees/` - List and create student fees
- GET/PUT/DELETE `/api/studentfees/<id>/` - Retrieve, update, delete student fee

### Expenses
- GET/POST `/api/expenses/` - List and create expenses
- GET/PUT/DELETE `/api/expenses/<id>/` - Retrieve, update, delete expense

## Deployment

1. Update the BASE_URL in `src/config.js` to point to your production backend
2. Build the application:
   ```
   npm run build
   ```
3. Deploy the contents of the `build` directory to your web server

## Testing

See [TESTING.md](TESTING.md) for detailed testing instructions.

## Dependencies

- React
- React Router DOM
- Axios
- Bootstrap
- React-Toastify
