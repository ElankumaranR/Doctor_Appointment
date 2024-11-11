import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import myLogo from '../logo.png';
import './home.css';

function Home() {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/checkAuth');
                setAuth(response.data);
            } catch (error) {
                console.log('Auth check failed:', error.response ? error.response.data : error);
                setAuth(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);
    

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/api/logout');
            setAuth(null);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <img src={myLogo} alt="Logo" width="40" height="40" className="d-inline-block align-top" />
                        &nbsp;
                        <p className='d-inline gradient-text'>Doctor Appointment</p>
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            {auth ? (
                                <>
                                    {auth.role === 'doctor' && (
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/doctor">Dashboard</Link>
                                        </li>
                                    )}
                                    {auth.role === 'admin' && (
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin">Dashboard</Link>
                                        </li>
                                    )}
                                    {auth.role === 'patient' && (
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/patient">Dashboard</Link>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            <header className="text-center py-5 text-white home content">
                <div className="cont_com">
                    <h1>Welcome to Doctor Appointment Application</h1>
                    <p className="lead">Book your appointments with ease and manage your health efficiently.</p>
                    <Link to="/register" className="btn btn-light btn-lg mt-3">Get Started</Link>
                </div>
            </header>

            <section className="container my-5">
                <h2 className="text-center mb-4">Our Services</h2>
                <div className="row">
                    <div className="col-md-4 text-center">
                        <i className="bi bi-calendar-check-fill display-4 text-primary"></i>
                        <h3 className="mt-3">Easy Appointments</h3>
                        <p>Quick and convenient appointment scheduling with your preferred doctors.</p>
                    </div>
                    <div className="col-md-4 text-center">
                        <i className="bi bi-file-medical-fill display-4 text-primary"></i>
                        <h3 className="mt-3">Medical Records</h3>
                        <p>Access your medical history and reports online, securely and conveniently.</p>
                    </div>
                    <div className="col-md-4 text-center">
                        <i className="bi bi-chat-heart-fill display-4 text-primary"></i>
                        <h3 className="mt-3">Doctor Consultations</h3>
                        <p>Consult with top specialists and get the best advice for your health needs.</p>
                    </div>
                </div>
            </section>

            <footer className="bg-light text-center py-4">
                <div className="container">
                    <p className="text-muted">&copy; 2024 Doctor Appointment Application. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
