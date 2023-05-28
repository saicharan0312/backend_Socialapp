const express = require('express');
const bodyParser = require('body-parser');
const { validationResult } = require('express-validator');
const { v4 } = require('uuid');

const HttpError = require('../models/http-error');
const getCoordinates = require('../util/location');

const Place = require('../models/place');

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
    let places;
    try {
        places = await Place.find({ creator : userId });
    } catch(err) {
        const error = new HttpError("something went wrong, Fetching places failed", 500);
        return next(error);
    }
    if(!places || places.length === 0) {
        return next(
            new HttpError('could not find the place with the provided user id', 404)
        );
    }
    res.json({places : places.map(place => place.toObject({ getters : true })) });
    // Mongo is a case sensitive with userId please make sure it is correct while retriving data from DB
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError("invalid inputs passed, please check the requirement", 422);
    }
    const { title, description, coordinates, address, creator } = req.body;
    const newCoordinates = getCoordinates(address);
    const createdPlace = new Place({
        title,
        description,
        address,
        location : newCoordinates,
        image : "https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png",
        creator,
    });
    try {
        createdPlace.save();
    } catch (err) {
        const error = new HttpError('creating place failed please try again later', 500);
        return next(err);
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
    place.title = title;
    place.description = description;
    try {
        await place.save();
    } catch(err) {
        const error = new HttpError("something went wrong could not upadte the place 2nd", 500);
        return next(error);
    }
    // const filterBy = {
    //     id : placeId,
    // }
    // const fieldsToBeUpdated = {
    //     title : title,
    //     description : description
    // };
    // let updatedPlace;
    // try {
    //     updatedPlace = await Place.findOneAndUpdate(filterBy, fieldsToBeUpdated, { new : true });
    // } catch(err) {
    //     const error = new HttpError("something went wrong could not update it", 500);
    //     return next(error);
    // }
    res.status(200).json({place : place.toObject({ getters : true }) });
};

// const deletePlace = async (req, res, next) => {
//     const placeId = req.params.pid;
//     let place;
//     try {
//         place = await Place.findById(placeId);
//     } catch (err) {
//         const error = new HttpError("something went wrong could not delete the place 1st", 500);
//         return next(error);
//     }
//     console.log(place);
//     try {
//         await place.remove();
//     } catch(err) {
//         const error = new HttpError("something went wrong could not delete the place 2nd", 500);
//         return next(error);
//     }
//     res.status(200).json({message : 'Deleted place.'});
// };

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
  
    let place;
    try {
      place = await Place.findById(placeId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not delete place.',
        500
      );
      return next(error);
    }
  
    try {
        await Place.deleteOne({ _id: placeId });
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not delete place.',
        500
      );
      return next(error);
    }
  
    res.status(200).json({ message: 'Deleted place.' });
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