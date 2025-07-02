const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve index.html

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'appuser',
  password: 'apppassword',
  database: 'testdb'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Create users table if not exists
const createTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  age INT
)
`;
db.query(createTable, err => {
  if (err) throw err;
  console.log('Users table ready');
});

// API: Add user
app.post('/users', (req, res) => {
  const { name, age } = req.body;
  if (!name || !age) return res.status(400).json({ error: 'Missing name or age' });
  db.query('INSERT INTO users (name, age) VALUES (?, ?)', [name, age], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, age });
  });
});

// API: Get all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
