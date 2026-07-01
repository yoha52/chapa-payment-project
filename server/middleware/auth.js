const jwt =require('jsonwebtoken');
function authenticateAdmin(req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({error:'malformed authorization token'});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.admin=decoded;
        next();
    }catch(err){
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
}

module.exports = authenticateAdmin;