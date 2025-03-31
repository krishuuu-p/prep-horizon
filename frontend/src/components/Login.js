import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Login.css';
import backIcon from '../assets/back-icon.svg';
import Typed from 'typed.js';
import { Eye, EyeOff } from "lucide-react";

function WelcomeText() {
    const textRef = useRef(null);

    useEffect(() => {
        const typed = new Typed(textRef.current, {
            strings: ["PrepHorizon"],
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
    const [userName, setUserName] = useState('');
    const [, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                id: userName,
                password: password,
                role: userType
            });
            
            setName(response.data.Name);
            navigate(`${userType}/${userName}/home`, {state: {name: response.data.Name}});
        } catch (error) {
            alert("Invalid credentials. Please try again.");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    const handleRegister = async () => {
        try {
            // const response = await axios.post('http://localhost:5000/register');
            alert("Registration successful. Please check your email for further instructions.");
        } catch (error) {
            alert("Invalid credentials. Please try again.");
        }
    }

    return (
        <div className="container">
            <WelcomeText />
            <div className="login-container">
                {!userType && (
                    <div className= "login-slide">
                        <h2 className="login-title">Login As</h2>
                        <div className="role-selection">
                            <button className="role-btn" onClick={() => setUserType('student')}>Student</button>
                            <button className="role-btn" onClick={() => setUserType('teacher')}>Teacher</button>
                            <button className="role-btn" onClick={() => setUserType('admin')}>Administrator</button>
                        </div>
                    </div>
                )}

                {userType && (
                    <div className= "login-form login-slide">
                        <div className="login-header">
                            <img 
                                src={backIcon} 
                                alt="Back" 
                                className="back-icon" 
                                onClick={() => {setUserType(null); setUserName(''); setPassword('');}} 
                            />
                            <h2>{`Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}</h2>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter Username/Email"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="input-field"
                        />
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        {userType === 'admin' && (
                            <div>
                                <p className="register-text">If you are a new user, please register your organization.</p>
                                <button className="register-btn" onClick={handleRegister}>Register Your Organization</button>
                            </div>
                        )}
                        
                        {/* 
                        <div style={{ marginTop: '20px' }}>
                            <p>
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </p>
                        </div>
                        */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
