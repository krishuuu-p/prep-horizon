import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [firstNumber, setFirstNumber] = useState(null);
  const [secondNumber, setSecondNumber] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: ask email and math captcha, 2: display password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Generate a math question on mount
  useEffect(() => {
    generateMathQuestion();
  }, []);

  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const num2 = Math.floor(Math.random() * 10) + 1;
    setFirstNumber(num1);
    setSecondNumber(num2);
    setUserAnswer('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if email is provided
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    // Validate the math question answer
    const correctAnswer = firstNumber + secondNumber;
    if (parseInt(userAnswer, 10) !== correctAnswer) {
      setError('Incorrect answer. Please try again.');
      generateMathQuestion();
      return;
    }
    // If answer is correct, call backend to retrieve password
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/retrieve-password`, { email });
      setPassword(response.data.password);
      setMessage('Password retrieved successfully.');
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error retrieving password.');
    }
  };

  return (
    <div style={{ width: '350px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Forgot Password</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          {firstNumber !== null && secondNumber !== null && (
            <div style={{ marginBottom: '15px' }}>
              <label>
                What is {firstNumber} + {secondNumber}?
              </label><br />
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          )}
          <button type="submit" style={{ width: '100%', padding: '10px' }}>
            Submit
          </button>
        </form>
      )}
      {step === 2 && (
        <div>
          <h3>Your Password is:</h3>
          <p style={{ fontWeight: 'bold' }}>{password}</p>
          <button
            onClick={() => navigate('/')}
            style={{ width: '100%', padding: '10px', marginTop: '20px' }}
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
