const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            const error = new HttpError("authentication failed 1 ", 401);
            return next(error);
        }
        const decodedToken = jwt.verify(token, 'saicharanreddypannala');
        req.userData = {
            userId : decodedToken.userId
        };
        next();
    } catch(err) { 
        const error = new HttpError("authentication failed 2", 401);
        return next(error);
    }
};