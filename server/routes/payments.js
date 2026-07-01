const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const crypto = require('crypto')
const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');
const generateTxRef = require('../utils/generateTxRef.js');
const {initiateLimiter}=require('../middleware/rateLimiters.js');

router.use(express.json())
router.post('/initiate',initiateLimiter, async (req, res) => {

    const { full_name, phone_number, amount } = req.body;
    if (!full_name || !phone_number || !amount) {
        return res.status(400).json({ error: 'full_name,phone_number and amount are required' })

    }

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment amount. Amount must be a positive number greater than 0."
        });
    }//check on amount

    const cleanPhone = phone_number.trim();// it removes any white spaces
    const ethiopianPhoneRegex = /^(09|07)\d{8}$/; //tests the phone number is it legit or not. how? checks if starts by 09 or 07 and afer that checks if the number has 8 degit
    if (!cleanPhone || !ethiopianPhoneRegex.test(cleanPhone)) {
        return res.status(400).json({
            success: false,
            message: "Validation failed: Phone number must be exactly 10 digits starting with 09 or 07, containing no letters."
        });
    }  //check on the phone number

    const cleanName = full_name ? full_name.trim() : '';
    if (!cleanName || cleanName.length < 2 || cleanName.length >35) {
        return res.status(400).json({
            success: false,
            message: "Validation failed: Full name must be between 2 and 100 characters long."
        });
    }//check on the name .about length and if it exists or not 

    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || nameParts[0];
    const tx_Ref = generateTxRef();
    const placeholderEmail = `${cleanPhone}@gmail.com`;

    try {
        // save pending payment before call chapa
        await pool.query(
            `INSERT INTO payments (full_name,phone_number,amount,tx_ref,chapa_status)
            VALUES($1,$2,$3,$4,'pending')`, [cleanName, cleanPhone, amount, tx_Ref]
        )
        console.log(`Pending payment row created — tx_ref: ${tx_Ref}, amount: ${amount}`);

        const requestBody = {
            amount,
            currency: 'ETB',
            email: placeholderEmail,
            first_name,
            last_name,
            phone_number,
            tx_ref: tx_Ref,
            callback_url: `${process.env.SERVER_URL}/api/payments/webhook`,
            return_url: `${process.env.CLIENT_URL}/payment-status?tx_ref=${tx_Ref}`,
            customization: {
                title: 'Payment',
                description: 'Complete your payment',
            },
        };

        const chapaResponse = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            }
        );
        const checkoutUrl = chapaResponse.data.data.checkout_url;
        console.log(`Chapa initialize succeeded — tx_ref: ${tx_Ref}, status: ${chapaResponse.data.status}`);

        return res.status(200).json({ url: checkoutUrl });

    } catch (err) {
        console.error('ERROR CODE:', err.code);
        console.error('ERROR MESSAGE:', err.message);
        console.error('STATUS:', err.response?.status);
        console.error('CHAPA RESPONSE BODY:', JSON.stringify(err.response?.data, null, 2));
        res.status(500).json({ error: 'Failed to initiate payment' });
    }


});

router.post('/webhook', async (req, res) => {

    try {
        const chapaSignature = req.headers['x-chapa-signature'];
        const computedSignature = crypto
            .createHmac('sha256', process.env.CHAPA_SECRET_HASH)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (chapaSignature !== computedSignature) {
            console.error('Webhook signature mismatch — possible fake request. Ignoring.');
            return res.status(401).send('Invalid signature');// if there is mismatch b/n signature adn chapasignature the server immeaditly stops
        }
        console.log('Webhook signature verified successfully.');
        const tx_ref = req.body.tx_ref;
        if (!tx_ref) {
            console.error('webhook tx_Ref is missing');
            return res.status(400).send('Missing transaction reference');
        }
        console.log(`Webhook received — tx_ref: ${tx_ref}, event: ${req.body.event}`);

        const verifyResponse = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                },
                timeout: 10000
            }
        )
        const chapaStatus = verifyResponse.data.data.status;
        console.log(`verified tx_Ref ${tx_ref}=> status ${chapaStatus}`)

        if (chapaStatus === 'success' || chapaStatus === 'failed') {

            const updateResult = await pool.query(
                `UPDATE payments 
                 SET chapa_status=$1 
                 WHERE tx_ref=$2 AND chapa_status='pending' 
                 RETURNING *`,
                [chapaStatus, tx_ref]
            );

            if (updateResult.rowCount === 0) {
                console.log(`Transaction ${tx_ref} was already processed or is not pending. Skipping credit logic.`);
                return res.status(200).send('Already processed');
            }

            console.log(`Transaction ${tx_ref} updated to status: ${chapaStatus}`);
            res.status(200).send();
        } else {
            console.log(`Transaction ${tx_ref} still pending — no DB update needed.`);
            res.status(200).send();
        }
    }

    catch (err) {
        console.error('Webhook processing error:', err.response?.data || err.message)
        return res.status(500).send('Internal server error processing webhook');

    }
})

router.get('/status/:tx_ref', async (req, res) => {
    const {tx_ref} = req.params;
    try {
        const result = await pool.query(
            `select chapa_status from payments where tx_ref=$1`, [tx_ref]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json({ status: result.rows[0].chapa_status });
    } catch(err) {
        console.error('Status check error:', err.message);
        res.status(500).json({ error: 'Failed to fetch status' });

    }
})

module.exports = router;