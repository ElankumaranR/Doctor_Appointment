// src/components/PatientList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
const PatientList = () => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/patients');
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };

        fetchPatients();
    }, []);

    

    return (
        <>
        <Navbar />
        <div className="container mt-5">
            <h3>Patient List</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map(patient => (
                        <tr key={patient.user_id}>
                            <td>{patient.user_id}</td>
                            <td>{patient.name}</td>
                            <td>{patient.email}</td>
                            <td>{patient.phone}</td>
                            
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default PatientList;
