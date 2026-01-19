import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, login, register, User } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const user: User | null = await checkAuth();
      if (user) {
        authLogin(user); // context feltöltése
        navigate('/todos');
      }
    };
    checkAuthStatus();
  }, [navigate, authLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isLogin) {
      const result = await login(email, password);

      if (result.success && result.user) {
        authLogin(result.user);
        navigate('/todos');
      } else {
        setMessage(result.message || 'Login failed');
      }
    } else {
      const result = await register(email, password);
      setMessage(result.message || '');
    }
  };

  return (
    <div className="login-container">
      <div style={{ width: '250px', margin: '0 auto' }}>
        <h1>{isLogin ? 'Login' : 'Register'}</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ width: '100%' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ width: '100%' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
            }}
          >
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ marginLeft: '10px' }}
            >
              Switch to {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;
