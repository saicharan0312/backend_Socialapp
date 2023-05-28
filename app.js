const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

// working with saicharan0312@gmail.com and cluster0 collestions and places
const url = "mongodb+srv://saicharan0312:<Password>@cluster0.wdscast.mongodb.net/places?retryWrites=true&w=majority"
const app = express();

app.use(bodyParser.json());

app.use('/api/places',placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if(res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500).json({message : error.message || "an unknow error occures"});
})

mongoose
    .connect(url)
    .then(()=>{
        app.listen(5000);
    })
    .catch((err) => {
        console.log(err);
    });