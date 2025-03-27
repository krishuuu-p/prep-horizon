import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import backIcon from '../assets/back-icon.svg';
import Typed from 'typed.js';
import { Eye, EyeOff } from "lucide-react";

function WelcomeText() {
  const textRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(textRef.current, {
      strings: ["Desi Assessment"],
      typeSpeed: 100,
      backSpeed: 50,
      startDelay: 500,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="welcome-container">
      <h3>Welcome to</h3>
      <h1><span ref={textRef}></span></h1>
      <h3>Your one-stop solution for seamless online assessments.</h3>
    </div>
  );
}

function Login() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        id: userId,
        password,
        role: userType
      });
      // Navigate to dashboard (e.g., /student, /teacher, /admin) with userId
      navigate(`${response.data.dashboard}/${userId}`);
    } catch (error) {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="container">
      <WelcomeText />

      <div className="login-container">
        {/* Step 1: Role selection */}
        {!userType && (
          <div className="login-slide">
            <h2 className="login-title">Login As</h2>
            <div className="role-selection">
              <button className="role-btn" onClick={() => setUserType('student')}>
                Student
              </button>
              <button className="role-btn" onClick={() => setUserType('teacher')}>
                Teacher
              </button>
              <button className="role-btn" onClick={() => setUserType('admin')}>
                Administrator
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Login form */}
        {userType && (
          <div className="login-form login-slide">
            <div className="login-header">
              <img
                src={backIcon}
                alt="Back"
                className="back-icon"
                onClick={() => {
                  setUserType(null);
                  setUserId('');
                  setPassword('');
                }}
              />
              <h2>{`Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}</h2>
            </div>
            <input
              type="text"
              placeholder="Enter ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input-field"
            />
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Forgot Password Link */}
            <div style={{ marginTop: '20px' }}>
              <p>
                <Link to="/forgot-password">Forgot Password?</Link>
              </p>
            </div>

            {/* Registration links for the chosen role only */}
            <div style={{ marginTop: '20px' }}>
              <p>Don't have an account?</p>
              {userType === 'student' && (
                <p>
                  <Link to="/register/student">Register as Student</Link>
                </p>
              )}
              {userType === 'teacher' && (
                <p>
                  <Link to="/register/teacher">Register as Teacher</Link>
                </p>
              )}
              {userType === 'admin' && (
                <p>
                  <Link to="/register/admin">Register as Administrator</Link>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
