const express = require('express');
const cors = require('cors');
const paymentsRouter = require('./routes/payments.js');
const adminRouter = require('./routes/admin');
const cookieParser = require('cookie-parser');


require('dotenv').config();
const app = express();
app.use(express.json());
const allowedOrigins = ['https://chapa-payment-project.vercel.app', 'https://chapa-payment-project.vercel.app']
app.set('trust proxy', 1);
app.use(cors({
    origin: function (origin, callback) {
            if (!origin) return callback(null, true)
            if (allowedOrigins.includes(origin)) { return callback(null, true) }
            else {callback(new Error('Not allowed by CORS'));}      
            },
             credentials: true}));

app.use(cookieParser());
app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
