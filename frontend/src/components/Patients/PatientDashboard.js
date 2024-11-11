import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillAlt, FaUserMd, FaClock, FaStethoscope, FaStar } from 'react-icons/fa';

function PatientDashboard() {
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [searchParams, setSearchParams] = useState({
        date: '',
        time: '',
        specialization: '',
        location: '',
        fee: ''
    });
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

    const fetchAvailableDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/search-doctors', { params: searchParams });
            setAvailableDoctors(response.data);
        } catch (error) {
            console.error('Error fetching available doctors:', error);
        }
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAvailableDoctors();
    };

    const handleBookAppointment = async (doctorId, availabilityId, date, time) => {
        try {
            const response = await axios.post('http://localhost:5000/api/appointments/book', {
                patient_id: currentUser.userId,
                doctor_id: doctorId,
                appointment_date: date,
                appointment_time: time,
                DA_id: availabilityId
            });

            alert(response.data.message);
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    className={i < rating ? "text-warning" : "text-muted"}
                />
            );
        }
        return stars;
    };

    return (
        <div className="container mt-5">
            <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/patient">Patient Dashboard</Link>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/patient/profile">Profile</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/patient/appointments">Appointments</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <h3 className="text-center mb-4">Find Available Doctors</h3>

            <form onSubmit={handleSearch} className="row g-3">
                <div className="col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={searchParams.date}
                        onChange={handleSearchChange}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="time"
                        className="form-control"
                        name="time"
                        value={searchParams.time}
                        onChange={handleSearchChange}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Specialization"
                        name="specialization"
                        value={searchParams.specialization}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Location"
                        name="location"
                        value={searchParams.location}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Fee"
                        name="fee"
                        value={searchParams.fee}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="col-md-2 d-grid">
                    <button type="submit" className="btn btn-primary">
                        <FaSearch className="me-2" /> Search
                    </button>
                </div>
            </form>

            <h5 className="mt-5">Available Doctors</h5>

            {availableDoctors.length > 0 ? (
                <div className="row mt-3">
                    {availableDoctors.map(doctor => (
                        <div key={doctor.user_id} className="col-md-4">
                            <div className="card mb-4 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <FaUserMd className="me-2 text-primary" />
                                        {doctor.name}
                                    </h5>
                                    <p className="card-text">
                                        <FaStethoscope className="me-2 text-secondary" />
                                        {doctor.specialization}
                                    </p>
                                    <p className="card-text">
                                        <FaMapMarkerAlt className="me-2 text-info" />
                                        {doctor.location}
                                    </p>
                                    <p className="card-text">
                                        <FaMoneyBillAlt className="me-2 text-success" />
                                        Fee: ${doctor.fee}
                                    </p>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <FaCalendarAlt className="me-2 text-warning" />
                                            {doctor.available_date}
                                        </div>
                                        <div>
                                            <FaClock className="me-2 text-warning" />
                                            {doctor.start_time} - {doctor.end_time}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <strong>Rating: </strong>
                                        <div>{renderStars(doctor.rating)}</div>
                                    </div>
                                    <button
                                        className="btn btn-success mt-3 d-block w-100"
                                        onClick={() => handleBookAppointment(doctor.user_id, doctor.availability_id, doctor.available_date, doctor.start_time)}
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="alert alert-info text-center mt-4">No doctors available for the selected criteria.</div>
            )}
        </div>
    );
}

export default PatientDashboard;
