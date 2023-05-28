const { validationResult } = require("express-validator");
const { v4 } = require('uuid');

const HttpError = require("../models/http-error");
const User = require('../models/user');

const DUMMY_USERS = [
    {
        id : 'u1',
        name : 'sai charan',
        email : "sai01@gmail.com",
        password : "saicha"
    }
]

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
    //console.log(existingUser);
    if(existingUser) {
        const error = new HttpError('user exist already, please login instead', 422);
        return next(error);
    }
    const createdUser = new User({
        name, 
        email,
        image : "https://media.licdn.com/dms/image/D4E35AQEfbyVJiTd5Hg/profile-framedphoto-shrink_400_400/0/1658426863656?e=1685905200&v=beta&t=BBL-5TURKCbkw4-xVsPIz7MUIg5iJPcQHxTAyYHGLxM",
        password,
        places : []
    });
    try {
        createdUser.save();
    } catch(err) {
        const error = new HttpError('Creating user failed please try again later', 500);
        return next(error);
    }
    res.status(201).json({user : createdUser });
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
    if(!existingUser || existingUser.password !== password) {
        const error = new HttpError("invalid credentials, could not log you in.", 401);
        return next(error);
    };
    res.status(200).json({message : "hello logged in"});
};

const DUMMY = [
    {
        "name" : 'sai charan',
        "email" : "sai01@gmail.com",
        "password" : "saicha"
    }
]

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;