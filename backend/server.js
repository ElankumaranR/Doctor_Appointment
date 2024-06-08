const bodyParser = require("body-parser");
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();
const port = 4055;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 const url = "mongodb://localhost:27017";
 const dbname = "jobquest";
 var db;

 MongoClient.connect(url) .then((client) => 
    {
        db = client.db(dbname);
        console.log(`Connected to MongoDB: ${dbname}`);
    });
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        // Add your authentication logic here
        if (username === 'test' && password === 'password') { // Example validation
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });