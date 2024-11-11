// src/components/DoctorProfile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorProfile.css';

const DoctorProfile = () => { 
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState({ userId: null, role: null });

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/current-user');
                setCurrentUser(response.data);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    const doctorId = currentUser.userId;

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/doctors/profile/${doctorId}`);
                setDoctor(response.data);
            } catch (err) {
                setError(err.message || 'Error fetching doctor profile');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorProfile();
    }, [doctorId]);
    const handleLogout = async () => {
        await axios.get('http://localhost:5000/api/logout');
    };

    if (loading) return <p>Loading...</p>;

    return (
        <>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/doctor">Doctor Dashboard</a>
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
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/doctor/">Dashboard</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/doctor/appointments">Appointments</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/doctor/feedback">Feedbacks</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/" onClick={handleLogout}>Logout</a>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </nav>
        <div className="doctor-profile-container">
            <h3>Doctor Profile</h3>
            {doctor && (
                <div>
                    <div className="doctor-profile-detail"><strong>Name:</strong> {doctor.name}</div>
                    <div className="doctor-profile-detail"><strong>Email:</strong> {doctor.email}</div>
                    <div className="doctor-profile-detail"><strong>Phone:</strong> {doctor.phone}</div>
                    <div className="doctor-profile-detail"><strong>Role:</strong> {doctor.role}</div>
                    <div className="doctor-profile-detail"><strong>Specialization:</strong> {doctor.specialization}</div>
                    <div className="doctor-profile-detail"><strong>Location:</strong> {doctor.location}</div>
                    <div className="doctor-profile-detail"><strong>Fee:</strong> ${doctor.fee}</div>
                    <div className="doctor-profile-detail"><strong>Rating:</strong> {doctor.rating}</div>
                </div>
            )}
        </div>
        </>
    );
};

export default DoctorProfile;
