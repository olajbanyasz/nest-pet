import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    navigate('/');
  };

  return (
    <button onClick={logout} style={{ position: 'absolute', top: '10px', right: '10px' }}>
      Logout
    </button>
  );
}

export default LogoutButton;