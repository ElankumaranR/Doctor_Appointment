import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Auth/Login';
import Signup from './components/Auth/signup';
import AdminDashboard from './components/Admin/AdminDashboard';
import DoctorDashboard from './components/Doctors/DoctorDashboard';
import PatientDashboard from './components/Patients/PatientDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddDoctor from './components/Admin/AddDoctor';
import DoctorList from './components/Admin/DoctorList';
import PatientList from './components/Admin/PatientList';
import Appointments from './components/Doctors/Appointments';
import PatientAppointments from './components/Patients/PatientAppointment';
import Profile from './components/Doctors/Profile';
import Home from './components/home';
import DoctorFeedback from './components/Doctors/FeedBack';
axios.defaults.withCredentials = true;

function App() {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/checkAuth');
                console.log(response.data);
                setAuth(response.data); 
            } catch (error) {
                console.log('Auth check failed:', error.response ? error.response.data : error);
                setAuth(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>; 
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setAuth={setAuth} />} />
                <Route path="/register" element={<Signup />} />

                {auth && auth.role === 'admin' && (
                    <>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/add-doctor" element={<AddDoctor />} />
                        <Route path="/admin/doctors-details" element={<DoctorList />} />
                        <Route path="/admin/patients" element={<PatientList />} />
                    </>
                )}
                {auth && auth.role === 'doctor' && (
                    <>
                        <Route path="/doctor" element={<DoctorDashboard />} />
                        <Route path="/doctor/appointments" element={<Appointments />} />
                        <Route path="/doctor/profile" element={<Profile />} />
                        <Route path="/doctor/feedback" element={<DoctorFeedback />} />
                    </>
                )}
                {auth && auth.role === 'patient' && (
                    <>
                        <Route path="/patient" element={<PatientDashboard />} />
                        <Route path="/patient/appointments" element={<PatientAppointments />} />
                    </>
                )}

                <Route path="*" element={<Navigate to={auth ? `/${auth.role}` : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;
