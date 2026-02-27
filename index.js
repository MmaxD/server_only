
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Create MySQL Connection (DO NOT specify the database here yet)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// 2. Connect and initialize database and tables
db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL server.');

  // Create database if it doesn't exist
  db.query("CREATE DATABASE IF NOT EXISTS sql12818316", (err, result) => {
    if (err) throw err;
    console.log("Database created or already exists.");

    // Select the database
    db.query("USE sql12818316", (err, result) => {
      if (err) throw err;
      
      // Create the users table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        )
      `;
      
      db.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log("Users table created or already exists.");
      });
    });
  });
});

// 3. Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required." });
  }
  
  try {
    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    
    db.query(sql, [email, password], (err, result) => {
      if (err) {
        // Handle the case where the email is already in the database
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send({ message: "An account with this email already exists." });
        }
        return res.status(500).send(err);
      }
      res.status(201).send({ message: "Account created successfully! You can now log in." });
    });
  } catch (error) {
    res.status(500).send({ message: "Error processing your request." });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));