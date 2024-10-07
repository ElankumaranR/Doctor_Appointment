import React from "react";
import "./Signup.css"; // Import the CSS for styling

class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            role: 'patient', // Default role
            error: ''
        };
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        const { username, email, password, role } = this.state;

        try {
            const response = await fetch('http://localhost:4055/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Signup successful:', data.message);
                this.setState({ error: '' });
                // Redirect to login or homepage after successful signup
            } else {
                this.setState({ error: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({ error: 'An error occurred. Please try again later.' });
        }
    };

    render() {
        return (
            <div className="signup-container">
                <h2>Signup</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={this.state.username}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={this.state.email}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={this.state.password}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role:</label>
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

                    <button type="submit">Signup</button>
                </form>
                {this.state.error && <p className="error">{this.state.error}</p>}
            </div>
        );
    }
}

export default Signup;
