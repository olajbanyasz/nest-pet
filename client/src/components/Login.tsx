import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAuth, login as apiLogin, register as apiRegister, User as ApiUser } from '../api/authApi';
import { useAuth, User as AuthUser, UserRole } from '../contexts/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, initialized } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/todos';

useEffect(() => {
  if (initialized) return;
  const checkAuthStatus = async () => {
    const user: ApiUser | null = await checkAuth();
    if (user) {
      const normalizedUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role.toLowerCase() === 'admin' ? 'admin' : 'user',
      };
      authLogin(normalizedUser);
      navigate(from, { replace: true });
    }
  };
  checkAuthStatus();
}, [authLogin, navigate, from, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isLogin) {
      const result = await apiLogin(email, password);

      if (result.success && result.user) {
        const normalizedUser: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name ?? undefined,
          role: result.user.role.toLowerCase() === 'admin' ? 'admin' : 'user',
        };
        authLogin(normalizedUser);
        navigate(from, { replace: true });
      } else {
        setMessage(result.message || 'Login failed');
      }
    } else {
      const result = await apiRegister(email, password);
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
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ width: '100%' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
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
