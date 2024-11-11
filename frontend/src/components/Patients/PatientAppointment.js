import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StarRatingComponent from 'react-star-rating-component';
import { FaCalendarAlt, FaUserMd, FaClock, FaTimes } from 'react-icons/fa';

function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [rating, setRating] = useState({});
    const [feedback, setFeedback] = useState({});
    const [existingFeedback, setExistingFeedback] = useState({});

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/current-user');
                const patientId = response.data.userId;
                fetchAppointments(patientId);
                fetchFeedback(patientId);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    const fetchAppointments = async (patientId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/patient/appointments/${patientId}`);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchFeedback = async (patientId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/feedback/${patientId}`);
            const feedbackData = response.data;

            if (Array.isArray(feedbackData)) {
                const feedbackMap = feedbackData.reduce((acc, item) => {
                    acc[item.appt_id] = item.comments;
                    return acc;
                }, {});
                const ratingMap = feedbackData.reduce((acc, item) => {
                    acc[item.appt_id] = item.rating;
                    return acc;
                }, {});

                setExistingFeedback(feedbackMap);
                setRating(ratingMap);
            } else {
                console.error('Feedback data is not an array:', feedbackData);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/appointments/${appointmentId}`);
            alert(response.data.message);
            setAppointments(prev => prev.filter(appt => appt.appointment_id !== appointmentId));
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    const handleRatingChange = async (appointmentId, newRating) => {
        try {
            const feedbackText = feedback[appointmentId] || '';
            await axios.post('http://localhost:5000/api/appointments/rate', {
                appointmentId,
                rating: newRating,
                comments: feedbackText,
            });

            setRating(prev => ({ ...prev, [appointmentId]: newRating }));
            alert('Thank you for rating the doctor!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        }
    };

    const handleFeedbackChange = (appointmentId, feedbackText) => {
        setFeedback(prev => ({ ...prev, [appointmentId]: feedbackText }));
    };

    const currentDate = new Date();

    return (
        <div className="container mt-5">
            <h3 className="text-center">Your Appointments</h3>
            <div className="appointment-list mt-4">
                {appointments.length > 0 ? (
                    appointments.map(appt => {
                        const appointmentDate = new Date(appt.appointment_date);
                        const isPastAppointment = appointmentDate < currentDate;

                        return (
                            <div key={appt.appointment_id} className="card appointment-card mb-3 shadow-sm">
                                <div className="card-body">
                                    <div className="appointment-header d-flex justify-content-between align-items-center">
                                        <h5 className="card-title">
                                            <FaUserMd className="me-2 text-primary" />
                                            {appt.doctor_name}
                                        </h5>
                                        <span className={`badge ${isPastAppointment && appt.status !== 'Rejected' ? 'bg-secondary' : appt.status === 'confirmed' ? 'bg-success' : appt.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                            {isPastAppointment && appt.status !== 'Rejected' ? 'Completed' : appt.status}
                                        </span>
                                    </div>
                                    <div className="appointment-details mt-3">
                                        <p className="mb-1">
                                            <FaCalendarAlt className="me-2 text-info" />
                                            <strong>Date:</strong> {appointmentDate.toLocaleDateString()}
                                        </p>
                                        <p className="mb-1">
                                            <FaClock className="me-2 text-info" />
                                            <strong>Time:</strong> {appt.appointment_time}
                                        </p>
                                    </div>
                                    {isPastAppointment && appt.status !== 'Rejected' && (
                                        <div className="mt-3">
                                            <p><strong>Rate Doctor:</strong></p>
                                            <StarRatingComponent
                                                name={`rate${appt.appointment_id}`}
                                                starCount={5}
                                                value={rating[appt.appointment_id] || 0}
                                                onStarClick={(nextValue) => handleRatingChange(appt.appointment_id, nextValue)}
                                            />
                                            <div className="mt-3">
                                                <label htmlFor={`feedback${appt.appointment_id}`}>Feedback:</label>
                                                <textarea
                                                    id={`feedback${appt.appointment_id}`}
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Enter your feedback"
                                                    value={feedback[appt.appointment_id] || existingFeedback[appt.appointment_id] || ''}
                                                    onChange={(e) => handleFeedbackChange(appt.appointment_id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {!isPastAppointment && appt.status !== 'Rejected' && (
                                        <button
                                            className="btn btn-danger mt-3"
                                            onClick={() => handleCancelAppointment(appt.appointment_id)}
                                        >
                                            <FaTimes className="me-2" />
                                            Cancel Appointment
                                        </button>
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
    );
}

export default PatientAppointments;
