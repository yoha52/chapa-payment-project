const express = require('express');
const cors = require('cors');
const paymentsRouter = require('./routes/payments.js');
const adminRouter = require('./routes/admin');
const cookieParser = require('cookie-parser');


require('dotenv').config();
const app = express();
app.use(express.json());


app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());  

app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
