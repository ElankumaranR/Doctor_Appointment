import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StarRatingComponent from 'react-star-rating-component';
import { FaUserAlt, FaStar } from 'react-icons/fa';
import './feed.css';

function DoctorFeedback() {
    const [appointments, setAppointments] = useState([]);
    const [feedbacks, setFeedbacks] = useState({});
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
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/doctor/appointments/${doctorId}`);
                setAppointments(response.data);
                fetchFeedbacks(response.data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        const fetchFeedbacks = async (appointments) => {
            try {
                const feedbackData = await Promise.all(
                    appointments.map(appt =>
                        axios.get(`http://localhost:5000/api/feedback/appointment/${appt.appointment_id}`)
                    )
                );
                const feedbackMap = feedbackData.reduce((acc, { data }) => {
                    acc[data.appt_id] = data;
                    return acc;
                }, {});
                setFeedbacks(feedbackMap);
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            }
        };

        fetchAppointments();
    }, [doctorId]);

    const handleLogout = async () => {
        await axios.get('http://localhost:5000/api/logout');
    };

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
                                <a className="nav-link" href="/" onClick={handleLogout}>Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container mt-5">
                <h3 className="text-center">Your Feedbacks</h3>
                <div className="feedback-list mt-4">
                    {appointments.length > 0 ? (
                        appointments.map((appt) => {
                            const feedback = feedbacks[appt.appointment_id];
                            return (
                                <div key={appt.appointment_id} className="card mb-3 feedback-card shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="card-title">
                                                <FaUserAlt className="me-2 text-primary" />
                                                Patient: {appt.patient_name}
                                            </h5>
                                            <span className="badge bg-info">{appt.status}</span>
                                        </div>
                                        <div className="mt-3">
                                            <p><strong>Appointment Date:</strong> {new Date(appt.appointment_date).toLocaleDateString()}</p>
                                            <p><strong>Time:</strong> {appt.appointment_time}</p>
                                        </div>
                                        {feedback ? (
                                            <div className="mt-3">
                                                <p><strong>Rating:</strong></p>
                                                <StarRatingComponent
                                                    name={`rating${appt.appointment_id}`}
                                                    starCount={5}
                                                    value={feedback.rating}
                                                    editing={false}  // Make the stars non-editable
                                                />
                                                <div className="mt-2">
                                                    <p><strong>Feedback:</strong></p>
                                                    <p>{feedback.comments}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>No feedback yet from the patient.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No appointments found.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default DoctorFeedback;
