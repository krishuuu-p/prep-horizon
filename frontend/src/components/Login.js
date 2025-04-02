import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
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
    const { user, setUser } = useUser();  // Access global state
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                id: user.userName,
                password: password,
                role: user.userType
            });

            setUser((prevUser) => ({
                ...prevUser,
                name: response.data.Name
            }));
            
            navigate(`/${user.userType}/${user.userName}/home`);
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
            alert("Registration successful. Please check your email for further instructions.");
        } catch (error) {
            alert("Invalid credentials. Please try again.");
        }
    }

    return (
        <div id="login-page">
            <WelcomeText />
            <div className="login-container">
                {!user.userType && (
                    <div className="login-slide">
                        <h2 className="login-title">Login As</h2>
                        <div className="role-selection">
                            <button className="role-btn" onClick={() => setUser({ ...user, userType: "student" })}>Student</button>
                            <button className="role-btn" onClick={() => setUser({ ...user, userType: "teacher" })}>Teacher</button>
                            <button className="role-btn" onClick={() => setUser({ ...user, userType: "admin" })}>Administrator</button>
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
                                onClick={() => setUser({ name: "", userType: null, userName: "" })} 
                            />
                            <h2>{`Login as ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}`}</h2>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter Username/Email"
                            value={user.userName}
                            onChange={(e) => setUser({ ...user, userName: e.target.value })}
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
                        {user.userType === 'admin' && (
                            <div>
                                <p className="register-text">If you are a new user, please register your organization.</p>
                                <button className="register-btn" onClick={handleRegister}>Register Your Organization</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;