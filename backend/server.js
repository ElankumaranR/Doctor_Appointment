const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const nodemailer = require('nodemailer');
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'arunkarthiks.22cse@kongu.edu',
        pass: 'viratarun'
    }
});
app.use(bodyParser.json());
app.use(session({
    secret: '12345678',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true
    }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '7339650722',
    database: 'doctor_appointment'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});

const createTable = `
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin', 'doctor', 'patient'),
    phone VARCHAR(20),
    specialization VARCHAR(100),
    location VARCHAR(100),
    fee DECIMAL(10, 2),
    rating DECIMAL(2, 1)
);
`;

db.query(createTable, (err, result) => {
    if (err) throw err;
    console.log('Users table created or already exists.');
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, phone, role, specialization, location, fee, rating } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (name, email, password, phone, role, specialization, location, fee, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [name, email, hashedPassword, phone, role, specialization, location, fee, rating], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error registering user' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

app.post('/api/login', (req, res) => {
 res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error querying database' });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
        req.session.userId = user.user_id;
        req.session.role = user.role;
            res.status(200).json({ message: 'Login successful', role: user.role, userId: user.user_id });
    });
});app.delete('/api/delete-unbooked-past-availability', async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

         db.execute(
            `DELETE FROM appointments 
             WHERE availability_id IN (
                 SELECT id FROM doctor_availability 
                 WHERE is_booked = 0 AND available_date < ?
             )`,
            [currentDate]
        );

        db.execute(
            `DELETE FROM doctor_availability 
             WHERE is_booked = 0 AND available_date < ?`,
            [currentDate]
        );

        res.status(200).json({
            message: `$ availability records deleted successfully along with associated appointments.`,
        });

    } catch (error) {
        console.error('Error deleting unbooked past availability and appointments:', error);
        res.status(500).json({ error: 'Failed to delete availability and appointment records' });
    }
});

app.get('/api/current-user', (req, res) => {
    if (req.session.userId) {
        console.log(req.session);
        res.json({ userId: req.session.userId, role: req.session.role });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});
app.post('/api/appointments/rate', (req, res) => {
    const { appointmentId, rating, comments } = req.body;
    if (!appointmentId || rating == null) {
        return res.status(400).json({ message: 'Appointment ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const query = `
        SELECT * FROM appointments 
        WHERE appointment_id = ?
    `;
    
    db.query(query, [appointmentId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Appointment not found or not completed' });
        }

        const doctorId = result[0].doctor_id;  
        const patientId = result[0].patient_id;

        const checkFeedbackQuery = `
            SELECT * FROM feedback WHERE appt_id = ? AND patient_id = ?
        `;
        
        db.query(checkFeedbackQuery, [appointmentId, patientId], (err, feedbackResult) => {
            if (err) {
                return res.status(500).json({ message: 'Error checking existing feedback', error: err });
            }

            if (feedbackResult.length > 0) {
                const updateFeedbackQuery = `
                    UPDATE feedback 
                    SET rating = ?, comments = ? 
                    WHERE appt_id = ? AND patient_id = ?
                `;
                db.query(updateFeedbackQuery, [rating, comments, appointmentId, patientId], (err, updateResult) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error updating feedback', error: err });
                    }

                    updateDoctorRating(doctorId, res);
                });
            } else {
                const insertFeedbackQuery = `
                    INSERT INTO feedback (patient_id, doctor_id, rating, comments, appt_id)
                    VALUES (?, ?, ?, ?, ?)
                `;
                db.query(insertFeedbackQuery, [patientId, doctorId, rating, comments, appointmentId], (err, insertResult) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error submitting feedback', error: err });
                    }

                    updateDoctorRating(doctorId, res);
                });
            }
        });
    });
});
function updateDoctorRating(doctorId, res) {
    const getAllFeedbackQuery = `
        SELECT rating FROM feedback WHERE doctor_id = ?
    `;
    db.query(getAllFeedbackQuery, [doctorId], (err, feedbacks) => {
        if (err) {
            return res.status(500).json({ message: 'Error calculating average rating', error: err });
        }

        const totalRatings = feedbacks.length;

        if (totalRatings === 0) {
            return res.status(400).json({ message: 'No feedback available for this doctor' });
        }

        const sumRatings = feedbacks.reduce((sum, feedback) => {
            const ratingValue = parseFloat(feedback.rating);
            return sum + (isNaN(ratingValue) ? 0 : ratingValue);
        }, 0);

        const averageRating = sumRatings / totalRatings;
        console.log('Calculated average rating:', averageRating);

        if (isNaN(averageRating)) {
            return res.status(500).json({ message: 'Calculated rating is invalid' });
        }

        const updateDoctorRatingQuery = `
            UPDATE users SET rating = ?
            WHERE user_id = ? AND role = 'doctor'
        `;
        
        db.query(updateDoctorRatingQuery, [averageRating, doctorId], (err, updateResult) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Error updating doctor rating', error: err });
            }

            res.json({ message: 'Rating and feedback submitted successfully' });
        });
    });
}


app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/api/checkAuth', (req, res) => {
    console.log(req.session.userId);
    const user = req.session.userId || null;
    const role = req.session.role || null; 
    console.log(req.session.role);
    if (user) {
        res.status(200).json({ role: role });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.get('/api/doctors', (req, res) => {
    const query = 'SELECT user_id, name, email, phone, specialization, location, fee, rating FROM users WHERE role = "doctor"';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching doctors' });
        }
        res.json(results);
    });
});

app.delete('/api/doctors/:id', (req, res) => {
    const doctorId = req.params.id;
    console.log(`Attempting to delete doctor with ID: ${doctorId}`);
    const query = 'DELETE FROM users WHERE user_id = ? AND role = "doctor"';
    
    db.query(query, [doctorId], (err, result) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
                return res.status(400).json({ message: 'Cannot delete doctor.Doctor has bookings.' });
            }
            console.error(err);
            return res.status(500).json({ message: 'Error deleting doctor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ message: 'Doctor deleted successfully' });
    });
});
app.get('/api/patients', (req, res) => {
    const query = 'SELECT user_id, name, email, phone FROM users WHERE role = "patient"';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error retrieving patients' });
        }
        res.status(200).json(results);
    });
});

app.delete('/api/patients/:id', (req, res) => {
    const patientId = req.params.id;
    const query = 'DELETE FROM users WHERE user_id = ? AND role = "patient"';
    
    db.query(query, [patientId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error deleting patient' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient deleted successfully' });
    });
});

app.get('/api/appointments', (req, res) => {
    const query = `
        SELECT a.appointment_id, u1.name AS patient_name, u2.name AS doctor_name, 
               a.appointment_date, a.appointment_time, a.status
        FROM appointments AS a
        JOIN users AS u1 ON a.patient_id = u1.user_id
        JOIN users AS u2 ON a.doctor_id = u2.user_id
    `;
    console.log("Appointmnts");

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            return res.status(500).json({ message: 'Error fetching appointments' });
        }
        res.json(results);
    });
});
app.get('/api/search-doctors', (req, res) => {
    const { date, time, specialization, location, fee } = req.query;

    console.log(date, time, specialization, location, fee);

    let query = `
        SELECT u.user_id, u.name, u.specialization, u.location, u.fee,u.rating,
               da.start_time, da.end_time,da.id AS availability_id,da.available_date
        FROM users u
        LEFT JOIN doctor_availability da ON u.user_id = da.doctor_id
        WHERE u.role = 'doctor'
        AND da.available_date = ? 
        AND da.start_time <= ? 
        AND da.end_time >= ? 
        AND da.is_booked = 0 
    `;

    const values = [date, time, time];

    if (specialization) {
        query += `AND u.specialization = ? `;
        values.push(specialization);
    }

    if (location) {
        query += `AND u.location = ? `;
        values.push(location);
    }

    if (fee) {
        query += `AND u.fee <= ? `;
        values.push(fee);
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching doctors:', err);
            return res.status(500).json({ message: 'Error fetching doctors' });
        }
        const formatDate = (isoString) => {
            const date = new Date(isoString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        results.forEach(result => {
            result.available_date = formatDate(result.available_date);
        });
        res.json(results);
        
    });
});

const updateRejectedAppointments = () => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE appointments
            SET status = 'Rejected'
            WHERE status = 'pending' AND appointment_date < CURDATE()
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

app.post('/api/appointments/update-rejected', async (req, res) => {
    try {
        const result = await updateRejectedAppointments();
        res.status(200).json({
            message: 'Appointments updated to Rejected successfully!',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error updating appointments:', error);
        res.status(500).json({ message: 'Failed to update appointments' });
    }
});
app.get('/api/doctor/appointments/:doctorId', (req, res) => {
    const doctorId = req.params.doctorId;

    const query = `
        SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, 
               d.name AS patient_name
        FROM appointments a
        JOIN users d ON a.patient_id = d.user_id
        WHERE a.doctor_id = ?
    `;

    db.query(query, [doctorId], (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            return res.status(500).json({ message: 'Error fetching appointments' });
        }
        res.json(results);
    });
});
app.get('/api/feedback/appointment/:appointmentId', (req, res) => {
    const appointmentId = req.params.appointmentId;

    const query = `
        SELECT f.appt_id, f.rating, f.comments, f.patient_id, u.name AS patient_name
        FROM feedback f
        JOIN users u ON f.patient_id = u.user_id
        WHERE f.appt_id = ?
    `;

    db.query(query, [appointmentId], (err, results) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).json({ message: 'Error fetching feedback' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Feedback not found for this appointment' });
        }
        res.json(results[0]); 
    });
});
app.get('/api/patient/appointments/:patientId', (req, res) => {
    const patientId = req.params.patientId;

    const query = `
        SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, 
               d.name AS doctor_name
        FROM appointments a
        JOIN users d ON a.doctor_id = d.user_id
        WHERE a.patient_id = ?
    `;

    db.query(query, [patientId], (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            return res.status(500).json({ message: 'Error fetching appointments' });
        }
        res.json(results);
    });
});

app.post('/api/doctors/availability',  (req, res) => {
    const { doctor_id, available_date, start_time, end_time } = req.body;
    const query = `
        INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time, is_booked)
        VALUES (?, ?, ?, ?, FALSE)
    `;

    try {
         db.query(query, [doctor_id, available_date, start_time, end_time]);
        res.json({ message: 'Availability added successfully' });
    } catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ message: 'Error adding availability' });
    }
});
app.get('/api/doctors/:doctorId/availability', (req, res) => {
    const doctorId = req.params.doctorId;
    const query = `
        SELECT available_date, start_time, end_time, is_booked
        FROM doctor_availability
        WHERE doctor_id = ?
    `;
    
    db.query(query, [doctorId], (error, results) => {
        if (error) {
            console.error('Error fetching availability:', error);
            return res.status(500).json({ message: 'Error fetching availability' });
        }
        res.json(results);
    });
});

app.post('/api/appointments/book', (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time,DA_id } = req.body;
    console.log(appointment_date);
    const query = `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status,availability_id)
        VALUES (?, ?, ?, ?, 'pending',?)
    `;

    const values = [patient_id, doctor_id, appointment_date, appointment_time,DA_id];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error booking appointment:', err);
            return res.status(500).json({ message: 'Error booking appointment' });
        }
        res.status(201).json({ message: 'Appointment request sent successfully' });
    });
});
app.get('/api/doctors/appointments', (req, res) => {
    const doctorId = req.query.doctorId;
    console.log("doctor/appointments");
    if (!doctorId) {
        return res.status(400).json({ message: 'Doctor ID is required' });
    }

    console.log("Fetching appointments for doctor ID:", doctorId);

    const query = `
        SELECT a.appointment_id, u.name AS patient_name, a.appointment_date, a.appointment_time, a.status,a.availability_id
        FROM appointments a
        JOIN users u ON a.patient_id = u.user_id
        WHERE a.doctor_id = ?
    `;

    db.query(query, [doctorId], (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            return res.status(500).json({ message: 'Error fetching appointments' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor' });
        }
        
        res.json(results);
    });
});

app.get('/api/feedback/:patientId', (req, res) => {
    const patientId = req.params.patientId;
    
    try {
        const query = `
            SELECT appt_id, rating, comments
            FROM feedback
            WHERE patient_id = ?;
        `;
        db.query(query, [patientId], (err, results) => {
            if (err) {
                console.error('Error fetching feedback:', err);
                res.status(500).json({ message: 'Error fetching feedback' });
            } else {
                res.json(results); 
            }
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});


app.put('/api/appointments/:appointmentId/status', (req, res) => {
    const { appointmentId } = req.params;
    const { status, availability_id } = req.body;

    const getPatientQuery = `
        SELECT users.email, appointments.patient_id 
        FROM appointments 
        JOIN users ON users.user_id = appointments.patient_id 
        WHERE appointment_id = ?;
    `;

    const updateAppointmentQuery = `
        UPDATE appointments
        SET status = ?
        WHERE appointment_id = ?
    `;

    const updateAvailabilityQuery = `
        UPDATE doctor_availability
        SET is_booked = 1
        WHERE id = ?;
    `;

    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Error processing request' });
        }

        db.query(getPatientQuery, [appointmentId], (err, result) => {
            if (err || result.length === 0) {
                return db.rollback(() => {
                    console.error('Error finding patient:', err);
                    res.status(500).json({ message: 'Error finding patient details' });
                });
            }

            const patientEmail = result[0].email;
            const patientId = result[0].patient_id;

            db.query(updateAppointmentQuery, [status, appointmentId], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error updating appointment status:', err);
                        res.status(500).json({ message: 'Error updating status' });
                    });
                }

                db.query(updateAvailabilityQuery, [availability_id], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error updating doctor availability:', err);
                            res.status(500).json({ message: 'Error updating availability' });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', err);
                                res.status(500).json({ message: 'Error processing request' });
                            });
                        }

                        const mailOptions = {
                            from: 'arunkarthiks.22cse@kongu.edu',
                            to: patientEmail,
                            subject: 'Appointment Status Update',
                            text: `Hello, your recent appointment  has been  ${status}.`
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                                return res.status(500).json({ message: 'Appointment updated but failed to send email' });
                            }
                            res.json({ message: 'Appointment status updated and notification sent successfully' });
                        });
                    });
                });
            });
        });
    });
});

app.delete('/api/appointments/:appointmentId', (req, res) => {
    const appointmentId = req.params.appointmentId;

    const getAppointmentQuery = `
        SELECT availability_id, status FROM appointments
        WHERE appointment_id = ?
    `;

    db.query(getAppointmentQuery, [appointmentId], (err, results) => {
        if (err) {
            console.error('Error fetching appointment:', err);
            return res.status(500).json({ message: 'Error fetching appointment' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const availablityId = results[0].availability_id;
        const appointmentStatus = results[0].status;

        const deleteAppointmentQuery = `
            DELETE FROM appointments
            WHERE appointment_id = ?
        `;

        db.query(deleteAppointmentQuery, [appointmentId], (err) => {
            if (err) {
                console.error('Error canceling appointment:', err);
                return res.status(500).json({ message: 'Error canceling appointment' });
            }

            if (appointmentStatus === 'Accepted') {
                const updateAvailabilityQuery = `
                    UPDATE doctor_availability
                    SET is_booked = 0
                    WHERE id = ?
                `;

                db.query(updateAvailabilityQuery, [availablityId], (err) => {
                    if (err) {
                        console.error('Error updating availability:', err);
                        return res.status(500).json({ message: 'Error updating availability' });
                    }

                    res.json({ message: 'Appointment canceled successfully and availability updated' });
                });
            } else {
                res.json({ message: 'Appointment canceled successfully, no availability update needed' });
            }
        });
    });
});
app.get('/api/doctors/profile/:id', (req, res) => {
    const doctorId = req.params.id;
    console.log(doctorId);
    db.query('SELECT * FROM users WHERE user_id =  ?', [doctorId], (err, results) => {
        if (err){
             return res.status(500).json({ message: 'Server error' });
        }            
        if (results.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(results[0]);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});