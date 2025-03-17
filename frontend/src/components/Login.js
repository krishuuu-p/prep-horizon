import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import backIcon from '../assets/back-icon.svg';
import { motion } from "framer-motion";
import Typed from 'typed.js';

function WelcomeText() {
    const textRef = useRef(null);

    useEffect(() => {
        const typed = new Typed(textRef.current, {
            strings: ["Desi Assessment"],  // The text to type out
            typeSpeed: 100,                // Typing speed in milliseconds
            backSpeed: 50,                 // Speed when deleting
            startDelay: 500,               // Delay before typing starts
            backDelay: 2000,               // Time before starting to delete
            loop: true,                    // Loop the animation indefinitely
            showCursor: true,              // Show blinking cursor
            cursorChar: "|",               // Cursor character
        });

        return () => {
            typed.destroy(); // Cleanup when component unmounts
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
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                id: userId,
                password: password,
                role: userType
            });
    
            navigate(`${response.data.dashboard}/${userId}`);
        } catch (error) {
            alert("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="container">
            <WelcomeText>
                <h3>Welcome to</h3>
                <h1>Desi Assessment</h1>
                <h3>Your one-stop solution for seamless online assessments.</h3>
            </WelcomeText>
            <div className="login-container">
                {!userType && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}  // Start hidden & to the right
                        animate={{ opacity: 1, x: 0 }}   // Animate into place
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="login-title">Login As</h2>
                        <div className="role-selection">
                            <button className="role-btn" onClick={() => setUserType('student')}>Student</button>
                            <button className="role-btn" onClick={() => setUserType('teacher')}>Teacher</button>
                            <button className="role-btn" onClick={() => setUserType('admin')}>Administrator</button>
                        </div>
                    </motion.div>
                )}

                {userType && (
                    <motion.div
                        className="login-form"
                        initial={{ opacity: 0, x: 50 }}  // Start hidden & to the right
                        animate={{ opacity: 1, x: 0 }}   // Animate into place
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="login-header">
                            <img 
                                src={backIcon} 
                                alt="Back" 
                                className="back-icon" 
                                onClick={() => {setUserType(null); setUserId(''); setPassword('');}} 
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
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                        />
                        <button className="login-btn" onClick={handleLogin}>Login</button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default Login;
