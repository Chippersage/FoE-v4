import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
/* eslint-disable */
const LoginPage = () => {
  const [employerId, setEmployerId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(employerId, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="employerId">Employer ID</label>
        <input
          type="text"
          id="employerId"
          value={employerId}
          onChange={(e) => setEmployerId(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
/* eslint-enable */
