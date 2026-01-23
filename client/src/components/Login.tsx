import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { register as apiRegister } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, user, initialized } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/todos';

  useEffect(() => {
    console.log('[Login] useEffect triggered: initialized=', initialized, 'user=', user);
    if (!initialized) return;

    if (user) {
      console.log('[Login] Navigating to:', from);
      if (window.location.pathname !== from) {
        navigate(from, { replace: true });
      }
    }
  }, [initialized, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        console.log('[Login] Logging in:', email);
        const result = await authLogin(email, password);
        if (!result.success) {
          setMessage(result.message || 'Login failed');
          console.log('[Login] Login failed:', result.message);
        }
      } else {
        console.log('[Login] Registering:', email);
        const result = await apiRegister(name, email, password);
        if (!result.success) {
          setMessage(result.message || 'Registration failed');
          console.log('[Login] Registration failed:', result.message);
        } else {
          const loginResult = await authLogin(email, password);
          if (!loginResult.success) {
            setMessage(loginResult.message || 'Login after registration failed');
            console.log('[Login] Login after registration failed');
          }
        }
      }
    } catch (err) {
      console.log('[Login] Unexpected error', err);
      setMessage('Unexpected error occurred');
    }
  };

  return (
    <div className="login-container">
      <div style={{ width: '250px', margin: '0 auto' }}>
        <h1>{isLogin ? 'Login' : 'Register'}</h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ width: '100%' }}>
              <label>Name:</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
            </div>
          )}
          <div style={{ width: '100%' }}>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ width: '100%' }}>
            <label>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ marginLeft: '10px' }}>
              Switch to {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
        {message && <p style={{ color: 'red' }}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
