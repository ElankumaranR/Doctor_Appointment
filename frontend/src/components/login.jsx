import React from "react";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
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
        const { username, password } = this.state;

        try {
            const response = await fetch('http://localhost:4055/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful:', data.message);
                this.setState({ error: '' });
            } else {
                this.setState({ error: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({ error: 'An error occurred. Please try again later.' });
        }
    }

    render() {
        return (
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={this.state.username}
                            onChange={this.handleInputChange}
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
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                {this.state.error && <p className="error">{this.state.error}</p>}
            </div>
        );
    }
}

export default Login;