import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AddDoctor.css'; // Optional: custom CSS for additional styling

const AddDoctor = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role] = useState('doctor'); // Default to 'doctor', no need for state
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [location, setLocation] = useState('');
    const [fee, setFee] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                name,
                email,
                password,
                role,
                phone,
                specialization,
                location,
                fee,
            });
            alert(response.data.message);
            resetForm();
        } catch (error) {
            console.error('Error adding doctor:', error);
            alert('Error adding doctor, please try again.');
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setSpecialization('');
        setLocation('');
        setFee('');
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5 ADcontainer">
                <h3 className="text-center mb-4">🩺 Add Doctor</h3>
                <form onSubmit={handleSubmit} className="shadow-lg p-4 rounded bg-light">
                    <div className="mb-3">
                        <label className="form-label">🧑‍⚕️ Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">📧 Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">🔒 Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">📞 Phone No:</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">🩺 Specialization</label>
                        <input
                            type="text"
                            className="form-control"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">🏥 Location</label>
                        <input
                            type="text"
                            className="form-control"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">💰 Fee</label>
                        <input
                            type="number"
                            className="form-control"
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">🚀 Add Doctor</button>
                </form>
            </div>
        </>
    );
};

export default AddDoctor;
