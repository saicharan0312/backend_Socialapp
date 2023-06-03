const express = require('express');
const bodyParser = require('body-parser');
const { validationResult } = require('express-validator');
const { v4 } = require('uuid');
const fs = require('fs');

const HttpError = require('../models/http-error');
const getCoordinates = require('../util/location');
const User = require('../models/user');

const Place = require('../models/place');
const { default: mongoose } = require('mongoose');

let DUMMY_PLACES = [
    {
        id : "p1",
        title : "4260 spoleto cir",
        description : "my 1st place in usa",
        location : {
            lan : 10.333,
            lng : -13.82,
        },
        address : "apartment 602",
        creator : "u1",
    },
    {
        id : "p2",
        title : "1350 San Remo pt",
        description : "my 2nd place in usa",
        location : {
            lan : 11.33,
            lng : -123.455,
        },
        address : "apartment 102",
        creator : "u2",
    }
]

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError('something went wrong could not find the place', 500);
        return next(error);
    }
    if(!place) {
        const error = new HttpError('could not find the place with the provided place id', 404);
        return next(error);
    }
    res.json({place : place.toObject( {getters : true} )});
    // why getters to true because we here in mongo id is stored as _id inorder to get rid of _
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch(err) {
        const error = new HttpError("something went wrong, Fetching places failed", 500);
        return next(error);
    }
    // if(!userWithPlaces || userWithPlaces.places.length === 0) {
    //     return next(
    //         new HttpError('could not find the places please share any', 404)
    //     );
    // }
    res.json({places : userWithPlaces.places.map(place => place.toObject({ getters : true })) });
    // Mongo is a case sensitive with userId please make sure it is correct while retriving data from DB
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new HttpError("invalid inputs passed, please check the requirement", 422);
        return next(error);
    }
    const { title, description, coordinates, address, creator } = req.body;
    const newCoordinates = getCoordinates(address);
    const createdPlace = new Place({
        title,
        description,
        address,
        location : newCoordinates,
        image : req.file.path,
        creator
    });
    let user;

    try {
        user = await User.findById(creator);
    } catch(err) {
        const error = new HttpError('creating place failed, please try again later', 500);
        return next(error);
    }
    
    if(!user) {
        const error = new HttpError('we could not find the user for the provide ID', 404);
        return next(error)
    }

    try {
        // createdPlace.save();
        const sesion = await mongoose.startSession();
        sesion.startTransaction();
        await createdPlace.save({ session : sesion });
        user.places.push(createdPlace);
        await user.save({ session : sesion });
        await sesion.commitTransaction();
    } catch (err) {
        const error = new HttpError('creating place failed please try again later', 500);
        return next(error);
    }
    res.status(200).json({place : createdPlace});
}

const updatePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return (new HttpError("invalid inputs passed, please check the requirement", 422));
    }
    const { title, description } = req.body;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError("something went wrong could not upadte the place 1st", 500);
        return next(error);
    }
    if(place.creator.toString() !== req.userData.userId) {
        const error = new HttpError("you are not allowed to change other place", 401);
        return next(error);
    }
    place.title = title;
    place.description = description;
    try {
        await place.save();
    } catch(err) {
        const error = new HttpError("something went wrong could not upadte the place 2nd", 500);
        return next(error);
    }
    res.status(200).json({place : place.toObject({ getters : true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
  
    let place;
    try {
      place = await Place.findById(placeId).populate('creator'); 
      // populate is used to search for the user exist and place also exist in the user document in array
    } catch (err) {
      const error = new HttpError('Something went wrong, could not delete place.',500);
      return next(error);
    }

    if(!place) {
        const error = new HttpError('Something went wrong, could not find the place for the ID.',500);
    }
    if(place.creator.id !== req.userData.userId) {
        const error = new HttpError("you are not allowed to delete this place", 401);
        return next(error);
    }
    const imagePath = place.image;

    try {
        const sesion = await mongoose.startSession();
        sesion.startTransaction();
        await Place.deleteOne({ _id: placeId }, {session : sesion});
        place.creator.places.pull(place);
        await place.creator.save({ session : sesion });
        await sesion.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not delete place.',
        500
      );
      return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log(err);
        res.status(200).json({ message: 'Deleted place.' });
    });
  };

let DUMMY = [
    {
        "title" : "A4260 spoleto cir",
        "description" : "Amy 1st place in usa",
        "coordinates" : {
            "lan" : 120.333,
            "lng" : -123.82
        },
        "address" : "Aapartment 602",
        "creator" : "u1"
    }
]

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

//647299f0b8ce2accb9aac975
//647299f0b8ce2accb9aac975