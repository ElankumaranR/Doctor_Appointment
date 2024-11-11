import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState('patient'); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
      phone,
      role,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/register', userData);
      console.log('User registered successfully', response.data);
      alert('User registered successfully!');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error registering user. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg px-4 py-5">
            <div className="row g-0">
              {/* Side Image */}
              <div className="col-md-5">
                <img
                  src="https://th.bing.com/th/id/OIP.YRZHgA5g8Rcswy9Fss3gxgHaHa?w=626&h=626&rs=1&pid=ImgDetMain"
                  className="img-fluid h-100 rounded-start"
                  alt="Registration Side"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              {/* Registration Form */}
              <div className="col-md-7">
                <div className="card-body">
                  <h2 className="card-title text-center text-primary mb-4">Patient Registration</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="mb-3 text-center">
                      <p>Already have an account? <a href='/login'>Login</a></p>
                    </div>

                    <div className="text-center">
                      <button type="submit" className="btn btn-primary w-100">Register</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
