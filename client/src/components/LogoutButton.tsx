import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton({ logout }: { logout: () => void }) {
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    logout();
    navigate('/');
  };

  return (
    <button onClick={onLogout} style={{ right: '10px' }}>
      Logout
    </button>
  );
}

export default LogoutButton;