const rateLimit=require('express-rate-limit');
const { message } = require('statuses');

const loginLimiter=rateLimit({
    windowMs:15*6*1000,
    max:5,
    message:{error:'to many login attempts,please try again in 15 minutes'},
    standardHeaders:true,
    legacyHeaders:false
})

const initiateLimiter=rateLimit({
    windowMs:15*6*1000,
    max:15,
    message:{error:'to many payment attempts,please try again later'},
    standardHeaders:true,
    legacyHeaders:false
})

module.exports = { loginLimiter, initiateLimiter };
