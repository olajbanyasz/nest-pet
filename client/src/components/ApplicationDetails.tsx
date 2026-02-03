import React from 'react';

interface ApplicationDetailsProps {
  appDetails: {
    totalUsers: number;
    totalAdmins: number;
    totalTodos: number;
    totalCompletedTodos: number;
    totalActiveTodos: number;
    totalDeletedTodos: number;
  };
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  appDetails,
}) => {
  const rowStyle = {
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    borderBottom: '1px solid #ddd',
    gap: '12px',
    color: '#888',
  };

  return (
    <div>
      {appDetails && (
        <div>
          <div style={rowStyle}>
            <div>Total Users:</div>
            <div>{appDetails.totalUsers}</div>
          </div>
          <div style={rowStyle}>
            <div>Total Admins:</div>
            <div>{appDetails.totalAdmins}</div>
          </div>
          <div style={rowStyle}>
            <div>Total Todos:</div>
            <div>{appDetails.totalTodos}</div>
          </div>
          <div style={rowStyle}>
            <div>Total Completed Todos:</div>
            <div>{appDetails.totalCompletedTodos}</div>
          </div>
          <div style={rowStyle}>
            <div>Total Active Todos:</div>
            <div>{appDetails.totalActiveTodos}</div>
          </div>
          <div style={rowStyle}>
            <div>Total Deleted Todos:</div>
            <div>{appDetails.totalDeletedTodos}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;
