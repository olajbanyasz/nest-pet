import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <button onClick={logout} style={{ position: 'absolute', top: '10px', right: '10px' }}>
      Logout
    </button>
  );
}

export default LogoutButton;