// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';  

function Login({ setAuth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            const { role } = response.data;
            setAuth(response.data);
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'doctor') {
                navigate('/doctor');
            } else if (role === 'patient') {
                navigate('/patient');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center vh-100">
            <div className="card login-card">
                <div className="card-body">
                    <h3 className="text-center mb-4">Login</h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Login</button>
                    </form>
                    <div className="text-center mt-3">
                        <Link to="/register" className="signup-link">Don't have an account? Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
