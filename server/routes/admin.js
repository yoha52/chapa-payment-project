const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db.js');
const authenticateAdmin = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiters.js')


router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' })


    }
    try {
        const result = await pool.query(
            'select * from admins where username=$1'
            , [username]
        )
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'invalid username or password' });
        }
        const admin = result.rows[0];
        const passwordMatches = await bcrypt.compare(password, admin.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'invalid username or password' });
        }
        const token = jwt.sign(
            { adminId: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000
        });
        res.status(200).json({ message: "login sucessful" })

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed' });

    }
})

router.get('/payments', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, full_name, phone_number, amount, tx_ref, chapa_status, created_at FROM payments ORDER BY created_at DESC'
        );
        res.status(200).json({ payments: result.rows });

    } catch (err) {
        console.error('Fetch payments error:', err.message);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
})

module.exports = router;