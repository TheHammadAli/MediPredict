import { StrictMode } from 'react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import AppContext from '../../Frontend/src/Context/AppContext.jsx';

const Root = () => {
  const [user, setUser] = useState(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <AppContext.Provider value={{ user, logout }}>
      <App />
    </AppContext.Provider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
