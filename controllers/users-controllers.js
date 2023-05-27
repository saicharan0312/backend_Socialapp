const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { v4 } = require('uuid');

const DUMMY_USERS = [
    {
        id : 'u1',
        name : 'sai charan',
        email : "sai01@gmail.com",
        password : "saicha"
    }
]

const getUsers = (req, res, next) => {
    res.status(200).json({users : DUMMY_USERS});
};

const signUp = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError("some fields are missing please submit it correctly", 422);
    }
    const {name ,email, password} = req.body;
    const hasUser = DUMMY_USERS.find((hu) => hu.email === email);
    if(hasUser) {
        throw new HttpError("could not create user coz user already exist", 422);
    }
    const createdUser = {
        id : v4(),
        name, 
        email,
        password
    };
    DUMMY_USERS.push(createdUser);
    res.status(201).json({user : createdUser});
};

const login = (req, res, next) => {
    const { email, password } = req.body;
    const user = DUMMY_USERS.find((u) => u.email === email);
    if(!user || user.password !== password) {
        throw new HttpError("User not found with this email or password incorrect", 404);
    }
    res.status(200).json({message : "hello logged in"});
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;