const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password'); // or you can use as -password "which is remove password"
    } catch(err) {
        const error = new HttpError('fetching users filed please try again later', 500);
        return next(error);
    }
    res.json({ users : users.map(user => user) });
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new HttpError("some fields are missing please submit it correctly", 422);
        return next(error);
    }
    const {name ,email, password } = req.body;

    let existingUser;
    try { 
        existingUser = await User.findOne({ email : email });
    } catch(err) {
        const error = new HttpError("SignUp failed please try again later", 500);
        return next(error);
    }
    if(existingUser) {
        const error = new HttpError('user exist already, please login instead', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch(err) {
        const error = new HttpError("something went wrong, Password cannot be hashed", 500);
        return next(error);
    }

    const createdUser = new User({
        name, 
        email,
        image : req.file.path,
        password : hashedPassword,
        places : []
    });
    try {
        createdUser.save();
    } catch(err) {
        const error = new HttpError('Creating user failed please try again later', 500);
        return next(error);
    }
    let token;
    try {
        token = jwt.sign(
            { userId : createdUser._id, email : createdUser.email }, 
            'saicharanreddypannala', 
            {expiresIn: '1hr'}
        );
    } catch(err) {
        const error = new HttpError('Creating user failed please try again later 1 ', 500);
        return next(error);
    }
    res
    .status(201)
    .json({userId : createdUser._id, email: createdUser.email, token : token });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try { 
        existingUser = await User.findOne({ email : email });
    } catch(err) {
        const error = new HttpError("Logging in failed please try again later", 500);
        return next(error);
    }
    if(!existingUser) {
        const error = new HttpError("invalid credentials, could not log you in.", 401);
        return next(error);
    };
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch(err) {
        const error = new HttpError("connot compare", 500);
        return next(error);
    }
    if(!isValidPassword) {
        const error = new HttpError('invalid credential try again later 1', 500);
        return next(error);
    }
    let token;
    try {
        token = jwt.sign(
            { userId : existingUser._id, email : existingUser.email }, 
            'saicharanreddypannala', 
            {expiresIn: '1hr'}
        );
    } catch(err) {
        const error = new HttpError('token failed please try again later 1 ', 500);
        return next(error);
    }
    res
    .status(200)
    .json({
        userId : existingUser._id,
        email : existingUser.email,
        token : token
    });
};


exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;

// 647954a0993cf5ee7a50446d
// 647954a0993cf5ee7a50446d