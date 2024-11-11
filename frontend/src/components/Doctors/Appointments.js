import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaCalendarAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import './Appointments.css'; // Custom CSS

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
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

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/doctors/appointments', {
                    params: { doctorId: currentUser.userId }
                });
                setAppointments(response.data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        if (currentUser.userId) {
            fetchAppointments();
        }
    }, [currentUser]);

    const handleUpdateStatus = async (appointmentId, status, availability_id) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
                status, availability_id
            });
            alert(response.data.message);
            setAppointments(prev =>
                prev.map(appt =>
                    appt.appointment_id === appointmentId ? { ...appt, status } : appt
                )
            );
        } catch (error) {
            console.error('Error updating appointment status:', error);
            alert('Failed to update appointment status. Please try again.');
        }
    };

    return (
        <div>
            {/* Navbar */}
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
                                <a className="nav-link" href="/doctor">Dashboard</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/doctor/appointments">Appointments</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/doctor/feedback">Feedbacks</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Appointments Table */}
            <div className="container mt-5 appointments-container">
                <h3 className="text-center mb-4">Appointments</h3>
                <table className="table table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th><FaUser /> Patient Name</th>
                            <th><FaCalendarAlt /> Date</th>
                            <th><FaClock /> Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(appt => (
                            <tr key={appt.appointment_id} className="appointment-row">
                                <td>{appt.patient_name}</td>
                                <td>{appt.appointment_date}</td>
                                <td>{appt.appointment_time}</td>
                                <td>
                                    <span className={`badge ${appt.status === 'pending' ? 'bg-warning' : appt.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>
                                        {appt.status}
                                    </span>
                                </td>
                                <td>
                                    {appt.status === 'pending' && (
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-success me-2"
                                                onClick={() => handleUpdateStatus(appt.appointment_id, 'Accepted', appt.availability_id)}
                                            >
                                                <FaCheck /> Accept
                                            </button>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => handleUpdateStatus(appt.appointment_id, 'Rejected')}
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Appointments;
