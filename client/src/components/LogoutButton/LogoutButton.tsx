import React from 'react';
import { useNavigate } from 'react-router-dom';

import { logout as apiLogout } from '../../api/authApi';

function LogoutButton({ logout }: { logout: () => void }) {
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
    logout();
    void navigate('/');
  };

  return (
    <button onClick={() => void onLogout()} style={{ right: '10px' }}>
      Logout
    </button>
  );
}

export default LogoutButton;
