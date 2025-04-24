import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import axios from 'axios';
import '../styles/LoginPage.css';
import backIcon from '../../assets/back-icon.svg';
import Typed from 'typed.js';
import { Eye, EyeOff } from 'lucide-react';

function WelcomeText() {
  const textRef = useRef(null);
  useEffect(() => {
    const typed = new Typed(textRef.current, {
      strings: ['PrepHorizon'],
      typeSpeed: 100,
      backSpeed: 50,
      startDelay: 500,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
    });
    return () => typed.destroy();
  }, []);

  return (
    <div className="welcome-container">
      <h3>Welcome to</h3>
      <h1><span ref={textRef}></span></h1>
      <h3>Your one-stop solution for seamless online assessments.</h3>
    </div>
  );
}

export default function LoginPage() {
  const { user, setUser } = useUser();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regMode, setRegMode] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const navigate = useNavigate();
  const BASE = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async () => {
    try {
      const resp = await axios.post(`${BASE}/login`, {
        id: user.userName,
        password,
        role: user.userType,
      });
      setUser(prev => ({ ...prev, name: resp.data.Name }));
      navigate(`/${user.userType}/${user.userName}/home`);
    } catch {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleKeyDown = e => { if (e.key === 'Enter') handleLogin(); };

  const validateReg = () => {
    if (!regName || !regUsername || !regEmail || !regPassword || !regConfirm) {
      setRegError('All fields required.'); return false;
    }
    if (!/\S+@\S+\.\S+/.test(regEmail)) {
      setRegError('Invalid email.'); return false;
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.'); return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setRegError('');
    if (!validateReg()) return;
    try {
      const res = await axios.post(`${BASE}/add-admin`, {
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });
      if (res.status === 201) {
        alert('Admin registered! You may now log in.');
        setRegMode(false);
        setRegName(''); setRegUsername(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
      }
    } catch (e) {
      setRegError(e.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div id="login-page">
      <WelcomeText />
      <div className="login-container">

        {!user.userType && (
          <div className="login-slide">
            <h2 className="login-title">Login As</h2>
            <div className="role-selection">
              <button className="role-btn" onClick={() => setUser({ ...user, userType: 'student' })}>Student</button>
              <button className="role-btn" onClick={() => setUser({ ...user, userType: 'teacher' })}>Teacher</button>
              <button className="role-btn" onClick={() => setUser({ ...user, userType: 'admin' })}>Administrator</button>
            </div>
          </div>
        )}

        {user.userType && (
          <div className="login-form login-slide">
            <div className="login-header">
              <img
                src={backIcon}
                alt="Back"
                className="back-icon"
                onClick={() => setUser({ name: '', userType: null, userName: '' })}
              />
              <h2>{`Login as ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}`}</h2>
            </div>

            {!regMode ? (
              <>
                <input
                  type="text"
                  placeholder="Enter Username/Email"
                  value={user.userName}
                  onChange={e => setUser({ ...user, userName: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                />
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-icon"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button className="login-btn" onClick={handleLogin}>Login</button>
                {user.userType === 'admin' && (
                  <div className="admin-register">
                    <p className="register-text">Register your organization here:</p>
                    <button className="register-btn" onClick={() => setRegMode(true)}>Register Organization</button>
                  </div>
                )}
              </>
            ) : (
              <div className="register-inline">
                <div className="register-header">
                  <img src={backIcon} alt="Back" className="reg-back-icon" onClick={() => setRegMode(false)} />
                  <h3>Organization Registration</h3>
                </div>
                {regError && <div className="error">{regError}</div>}
                <input type="text" placeholder="Organization Name" value={regName} onChange={e => setRegName(e.target.value)} />
                <input type="text" placeholder="Username" value={regUsername} onChange={e => setRegUsername(e.target.value)} />
                <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                <input type="password" placeholder="Confirm Password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                <div className="form-actions">
                  <button type="button" onClick={() => setRegMode(false)}>Cancel</button>
                  <button type="button" onClick={handleRegister}>Submit</button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
