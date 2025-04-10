# School Management System - Testing Guide

This document provides guidance for testing the School Management System React application.

## Prerequisites

1. Ensure your Django backend is running on http://localhost:8000
2. If your backend is running on a different URL, update the BASE_URL in `src/config.js`

## Running the Application

```bash
cd school-management-system
npm start
```

## Testing CRUD Operations

### Teachers Module

#### Teacher List
- Verify teachers are displayed correctly
- Test search and filter functionality
- Confirm delete operation works

#### Teacher Form
- Test creating a new teacher
- Test editing an existing teacher
- Verify validation works correctly
- Confirm cancel operation returns to list view

#### Teacher Payments
- Verify payments are displayed correctly
- Test creating a new payment
- Test editing an existing payment
- Confirm delete operation works

#### Generate Teacher Payments
- Test selecting multiple teachers
- Verify batch payment generation works

### Students Module

#### Student List
- Verify students are displayed correctly
- Test search and filter functionality
- Confirm delete operation works

#### Student Form
- Test creating a new student
- Test editing an existing student
- Verify validation works correctly
- Confirm cancel operation returns to list view

#### Student Fees
- Verify fees are displayed correctly
- Test creating a new fee
- Test editing an existing fee
- Confirm delete operation works

### Expenses Module

#### Expense List
- Verify expenses are displayed correctly
- Test search and filter functionality
- Confirm delete operation works

#### Expense Form
- Test creating a new expense
- Test editing an existing expense
- Verify validation works correctly
- Confirm cancel operation returns to list view

## Error Handling

- Test error handling by intentionally causing errors:
  - Disconnect from the internet to test network error handling
  - Try to access non-existent resources
  - Submit invalid data to forms

## Responsive Design

- Test the application on different screen sizes:
  - Desktop
  - Tablet
  - Mobile

## Browser Compatibility

- Test the application in different browsers:
  - Chrome
  - Firefox
  - Safari
  - Edge

## Deployment Checklist

- Update API_CONFIG.BASE_URL in config.js to point to production backend
- Run `npm run build` to create production build
- Deploy the build folder to your web server
