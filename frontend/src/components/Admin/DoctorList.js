// src/components/DoctorList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DoctorList.css'; // Optional: custom CSS for additional styling

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/doctors');
                setDoctors(response.data);
            } catch (error) {
                console.error('Error fetching doctor details:', error);
            }
        };

        fetchDoctors();
    }, []);

    const handleDelete = async (doctorId) => {
        try {
            await axios.delete(`http://localhost:5000/api/doctors/${doctorId}`);
            setDoctors(doctors.filter(doctor => doctor.user_id !== doctorId));
            alert('Doctor deleted successfully');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Cannot delete doctor he has bookings.');
            } else {
                alert('Error deleting doctor. Please try again later.');
            }
            console.error('Error deleting doctor:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5 doctor-list-container">
                <h3 className="text-center mb-4">Doctor List</h3>
                <table className="table table-striped shadow rounded bg-white doctor-list-table">
                    <thead className="table-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>Location</th>
                            <th>Phone</th>
                            <th>Fee</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(doctor => (
                            <tr key={doctor.user_id} className="appointment-row">
                                <td>{doctor.name}</td>
                                <td>{doctor.email}</td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.location}</td>
                                <td>{doctor.phone}</td>
                                <td>{doctor.fee}</td>
                                <td>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => handleDelete(doctor.user_id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DoctorList;
