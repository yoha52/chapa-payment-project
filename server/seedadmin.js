require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function seedAdmin() {
  const username = 'admin';           // change this to whatever you want
  const plainPassword = 'YourStrongPassword123'; // change this too

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    await pool.query(
      `INSERT INTO admins (username, password_hash) VALUES ($1, $2)`,
      [username, passwordHash]
    );
    console.log('Admin created successfully:', username);
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    pool.end(); // closes the DB connection so the script actually exits
  }
}

seedAdmin();