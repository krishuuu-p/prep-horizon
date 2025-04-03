import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Basic front-end validation
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    // Simple email check (for demonstration). For production, consider a more robust regex or library.
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    try {
      // POST request to your backend /register endpoint
      const response = await axios.post('http://localhost:5002/register', {
        username,
        email,
        password
      });
      if (response.status === 201) {
        alert("Registration successful. Please login.");
        navigate('/'); // Redirect to login page
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div style={{ width: '350px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Register</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label><br />
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Email:</label><br />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Confirm Password:</label><br />
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '8px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
