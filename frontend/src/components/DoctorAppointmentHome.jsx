import React from "react";
import "./DoctorAppointmentHome.css"; // Import the CSS for styling

const DoctorAppointmentHome = () => {
    return (
        <div className="homepage-container">
            <nav className="navbar">
                <div className="logo">Book Your Doctor Appointment</div>
                <ul className="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/services">Services</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li><a href="/login">Login/Signup</a></li>
                </ul>
            </nav>
            
            <header className="hero-section">
                <div className="hero-content">
                    <h1>Book Your Doctor Appointment Online</h1>
                    <p>Find the best doctors, book appointments and manage your health online.</p>
                    <div className="cta-buttons">
                        <button className="cta-find">Find a Doctor</button>
                        <button className="cta-book">Book Now</button>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/path-to-doctor-image.jpg" alt="Doctor" />
                </div>
            </header>

            <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <img src="/path-to-icon1.png" alt="Step 1" />
                        <p>Search for Doctors</p>
                    </div>
                    <div className="step">
                        <img src="/path-to-icon2.png" alt="Step 2" />
                        <p>Choose the Date</p>
                    </div>
                    <div className="step">
                        <img src="/path-to-icon3.png" alt="Step 3" />
                        <p>Confirm Appointment</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DoctorAppointmentHome;
