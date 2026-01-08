import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, login, register } from '../api/authApi';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        navigate('/todos');
      }
    };
    checkAuthStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = isLogin ? await login(email, password) : await register(email, password);
    setMessage(result.message || '');
    if (result.success && isLogin) {
      navigate('/todos');
    }
  };

  return (
    <div className="App">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;