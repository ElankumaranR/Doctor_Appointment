import React from "react";
import './login.css'; // Import the custom CSS
import { Navigate } from "react-router-dom";  // For redirection after login

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            role: 'patient',  // Default role as 'patient'
            error: '',
            redirect: null  // State to handle redirection after login
        };
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const { username, password, role } = this.state;

        try {
            const response = await fetch('http://localhost:4055/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, role })  // Sending role to backend
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful:', data.message);
                this.setState({ error: '' });
                
                // Redirect logic here based on role
                if (role === 'doctor') {
                    this.setState({ redirect: '/doctor-dashboard' });
                } else if (role === 'patient') {
                    this.setState({ redirect: '/patient-dashboard' });
                }
            } else {
                this.setState({ error: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({ error: 'An error occurred. Please try again later.' });
        }
    }

    render() {
        // Handle redirection after login
        if (this.state.redirect) {
            return <Navigate to={this.state.redirect} />;
        }

        return (
            <div className="login-container">
                <div className="login-box">
                    <h2>Login</h2>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={this.state.username}
                                onChange={this.handleInputChange}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={this.state.password}
                                onChange={this.handleInputChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Login as</label>
                            <select
                                id="role"
                                name="role"
                                value={this.state.role}
                                onChange={this.handleInputChange}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </div>
                        <button type="submit" className="login-btn">Login</button>
                    </form>
                    {this.state.error && <p className="error">{this.state.error}</p>}
                </div>
            </div>
        );
    }
}

export default Login;
