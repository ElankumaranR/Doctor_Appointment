// src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Custom CSS for enhanced styling

function AdminDashboard() {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await axios.get('http://localhost:5000/api/logout');
        navigate('/');
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/appointments');
                setAppointments(response.data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <div className="container mt-5 admin-dashboard">
            <h3 className="text-center">Admin Dashboard</h3>

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
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
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/patients">Patients</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#"
                                   id="doctorsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Doctors
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="doctorsDropdown">
                                    <li><Link className="dropdown-item" to="/admin/add-doctor">Add Doctor</Link></li>
                                    <li><Link className="dropdown-item" to="/admin/doctors-details">Doctors Details</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <Link className="nav-link text-danger" to="/" onClick={handleLogout}>Logout</Link>
                    </div>
            </nav>

            {/* Appointments Section */}
            <div className="appointments-section">
                <h4 className="text-center mb-4">Appointment List</h4>
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Appointment ID</th>
                            <th>Patient Name</th>
                            <th>Doctor Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? (
                            appointments.map(appointment => (
                                <tr key={appointment.appointment_id}>
                                    <td>{appointment.appointment_id}</td>
                                    <td>{appointment.patient_name}</td>
                                    <td>{appointment.doctor_name}</td>
                                    <td>{appointment.appointment_date}</td>
                                    <td>{appointment.appointment_time}</td>
                                    <td>
                                        <span className={`badge ${appointment.status === 'Accepted' ? 'bg-success' : appointment.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No appointments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
