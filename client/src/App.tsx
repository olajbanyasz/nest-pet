import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Todos from './components/Todos';
import AppLayout from './components/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/todos" element={<Todos />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
