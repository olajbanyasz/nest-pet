import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

  const state = location.state as { from?: { pathname: string } } | null;
  const from = state?.from?.pathname || '/todos';

  useEffect(() => {
    if (!initialized) return;

    if (user) {
      if (window.location.pathname !== from) {
        void navigate(from, { replace: true });
      }
    }
  }, [initialized, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        const result = await authLogin(email, password);
        if (!result.success) {
          setMessage(result.message || 'Login failed');
        }
      } else {
        const result = await apiRegister(name, email, password);
        if (!result.success) {
          setMessage(result.message || 'Registration failed');
        } else {
          const loginResult = await authLogin(email, password);
          if (!loginResult.success) {
            setMessage(
              loginResult.message || 'Login after registration failed',
            );
          }
        }
      }
    } catch {
      setMessage('Unexpected error occurred');
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  return (
    <div className="login-container">
      <div style={{ width: '250px', margin: '0 auto' }}>
        <h1>{isLogin ? 'Login' : 'Register'}</h1>
        <form onSubmit={onFormSubmit}>
          {!isLogin && (
            <div style={{ width: '100%' }}>
              <label htmlFor="name">Name:</label>
              <InputText
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          )}
          <div style={{ width: '100%' }}>
            <label htmlFor="email">Email:</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ width: '100%' }}>
            <label htmlFor="password">Password:</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              required
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
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
            <Button type="submit">{isLogin ? 'Login' : 'Register'}</Button>
            <Button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ marginLeft: '10px' }}
            >
              Switch to {isLogin ? 'Register' : 'Login'}
            </Button>
          </div>
        </form>
        {message && <p style={{ color: 'red' }}>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
