const jwt = require('jsonwebtoken');

const hashedSecret = require("../crypto/crypto.js");
const users = require ("../data/users.js")


function generateToken(user) {
    return jwt.sign({user: user.id}, hashedSecret,{expiresIn: '1h'});
}


function verifyToken(req,res,next) {
    const token = req.session.token;
    
    if(!token){
        return res.status(401).json({message: 'No se ha proporcionado el Token'})
    }
    jwt.verify(token, hashedSecret, (err,decoded) => {
        if(err){
            return res.status(401).json({message: 'Token incorrecto'})
        }
        
        req.user=decoded.user;
        next();
    });
}


module.exports = {generateToken,verifyToken};