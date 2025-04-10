import React from 'react';
import withApiIntegration from '../../utils/withApiIntegration';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

// Example of enhancing a component with API integration
// This is a wrapper for TeacherList component that adds API integration
const EnhancedTeacherList = ({ apiHelpers }) => {
  const navigate = useNavigate();
  const { loading, withLoading, handleApiError } = apiHelpers;
  const [teachers, setTeachers] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await withLoading(
          () => teacherService.getAllTeachers(),
          null // No success message for initial load
        );
        setTeachers(response.data);
      } catch (err) {
        setError('Failed to fetch teachers');
      }
    };

    fetchTeachers();
  }, [withLoading]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await withLoading(
          () => teacherService.deleteTeacher(id),
          'Teacher deleted successfully'
        );
        setTeachers(teachers.filter(teacher => teacher.id !== id));
      } catch (err) {
        // Error is already handled by withLoading
      }
    }
  };

  // The rest of the component remains the same as TeacherList
  // but uses the enhanced props and handlers

  return (
    <div className="container mt-4">
      {/* Component UI remains the same */}
    </div>
  );
};

// Export the enhanced component
export default withApiIntegration(EnhancedTeacherList);
