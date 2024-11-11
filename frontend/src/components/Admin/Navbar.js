import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await axios.get('http://localhost:5000/api/logout');
        navigate('/');
    };

    return (
<nav className="navbar navbar-expand-lg navbar-light navbar-custom">
<div className="container-fluid">
                <Link className="navbar-brand" to="/admin">Admin</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/patients">Patients</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/doctors-details">Doctors</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/add-doctor">Add Doctor</Link>
                        </li>
                    </ul>
                </div>
                <Link className="nav-link text-danger" to="/" onClick={handleLogout}>Logout</Link>
            </div>
        </nav>
    );
};

export default Navbar;
