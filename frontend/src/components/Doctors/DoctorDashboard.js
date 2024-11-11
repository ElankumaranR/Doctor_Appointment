import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCalendarAlt, FaClock, FaPlusCircle } from 'react-icons/fa';
import './dash.css';

function DoctorDashboard() {
    const [availableDate, setAvailableDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [message, setMessage] = useState('');
    const [availabilities, setAvailabilities] = useState([]);
    const [currentUser, setCurrentUser] = useState({ userId: null, role: null });

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/current-user');
                setCurrentUser(response.data);
                fetchAvailabilities(response.data.userId);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    const fetchAvailabilities = async (doctorId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}/availability`);
            setAvailabilities(response.data);
        } catch (error) {
            console.error('Error fetching availabilities:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/doctors/availability', {
                doctor_id: currentUser.userId,
                available_date: availableDate,
                start_time: startTime,
                end_time: endTime,
            });
            setMessage(response.data.message);
            setAvailableDate('');
            setStartTime('');
            setEndTime('');
            fetchAvailabilities(currentUser.userId);
        } catch (error) {
            console.error('Error adding availability:', error);
            setMessage('Failed to add availability. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (timeString) => {
        const time = new Date(timeString);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/doctor">Doctor Dashboard</a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link active" href="/doctor/profile">Profile</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/doctor/appointments">Appointments</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/doctor/feedback">Feedbacks</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/" onClick={() => axios.get('http://localhost:5000/api/logout')}>Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Doctor Availability Form */}
            <div className="container mt-5">
                <h3 className="text-center mb-4">Set Your Availability</h3>
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="availability-form mt-4">
                            <div className="mb-3">
                                <label className="form-label">
                                    <FaCalendarAlt className="me-2" /> Available Date:
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={availableDate}
                                    onChange={(e) => setAvailableDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    <FaClock className="me-2" /> Start Time:
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    <FaClock className="me-2" /> End Time:
                                </label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                <FaPlusCircle className="me-2" /> Add Availability
                            </button>
                        </form>
                        {message && <div className="alert alert-info mt-3">{message}</div>}
                    </div>
                </div>

                {/* Availability Table */}
                <h3 className="text-center mb-3">Your Availability</h3>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Booked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availabilities.length > 0 ? (
                                    availabilities.map((availability, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(availability.available_date)}</td>
                                            <td>{availability.start_time}</td>
                                            <td>{availability.end_time}</td>
                                            <td>{availability.is_booked ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No availability set</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;
