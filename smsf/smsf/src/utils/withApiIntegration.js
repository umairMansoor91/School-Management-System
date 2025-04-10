import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Higher-order component to add API integration and error handling
const withApiIntegration = (WrappedComponent, options = {}) => {
  return (props) => {
    const [loading, setLoading] = useState(false);
    
    // Generic error handler for API calls
    const handleApiError = (error, customMessage = null) => {
      console.error('API Error:', error);
      
      let errorMessage = customMessage || 'An error occurred. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Network error. Please check your connection.';
      }
      
      // Show error notification
      toast.error(errorMessage);
      
      return errorMessage;
    };
    
    // Generic success handler
    const handleApiSuccess = (message = 'Operation completed successfully') => {
      toast.success(message);
    };
    
    // Wrapper for API calls to handle loading state
    const withLoading = async (apiCall, successMessage = null) => {
      setLoading(true);
      try {
        const result = await apiCall();
        if (successMessage) {
          handleApiSuccess(successMessage);
        }
        setLoading(false);
        return result;
      } catch (error) {
        handleApiError(error);
        setLoading(false);
        throw error;
      }
    };
    
    const enhancedProps = {
      ...props,
      apiHelpers: {
        loading,
        setLoading,
        handleApiError,
        handleApiSuccess,
        withLoading
      }
    };
    
    return (
      <>
        <WrappedComponent {...enhancedProps} />
        <ToastContainer position="top-right" autoClose={5000} />
      </>
    );
  };
};

export default withApiIntegration;
