const express = require('express');
const bodyParser = require('body-parser');
const { validationResult } = require('express-validator');
const { v4 } = require('uuid');

const HttpError = require('../models/http-error');
const getCoordinates = require('../util/location');

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

const getPlaceById = ((req, res, next) => {
    const placesId = req.params.pid;
    const place = DUMMY_PLACES.find((p) => { 
        return p.id === placesId
    });
    if(!place) {
        throw new HttpError('could not find the place with the place id', 404);
    }
    res.json({place : place});
});

const getPlacesByUserId = ((req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter((u) => {
        return u.creator === userId;
    })
    if(!places || places.length === 0) {
        return next(
            new HttpError('could not find the place with the user id', 404)
        );
    }
    res.json({places : places});
});

const createPlace = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError("invalid inputs passed, please check the requirement", 422);
    }
    const { title, description, coordinates, address, creator } = req.body;
    const newCoordinates = getCoordinates(address);
    const createPlace = {
        id : v4(),
        title,
        description,
        location : newCoordinates,
        address,
        creator,
    }
    DUMMY_PLACES.push(createPlace);
    res.status(200).json({place : createPlace});
}

const updatePlace = (req, res, next) => {
    const placeId = req.params.pid;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError("invalid inputs passed, please check the requirement", 422);
    }
    const { title, description } = req.body;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;
    DUMMY_PLACES[placeIndex] = updatedPlace;
    res.status(200).json({place : updatedPlace});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if(!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError("could not find the place you want to delete", 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({message : 'Deleted place.'});
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