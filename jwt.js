const jwt = require('jsonwebtoken');
// require('dotenv').config();



const jwtAuthMiddleware = (req, res, next) => {

    // first check if request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({ error: 'token not found' })

    // extract the jwt token from the request header
    const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the format "Bearer
    if (!token) return res.status(401).json({ error: 'unauthorized' })
    try {
        // verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach user information to the request object
        req.user = decoded
        next();
    } catch (err) {
        console.log(err)
        res.status(401).json({ error: "invalid token" })
    }
}

// function to generate a jwt token
const generateToken = (userData) => {
    // generate a new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: '12h'});

}


module.exports = { jwtAuthMiddleware, generateToken };