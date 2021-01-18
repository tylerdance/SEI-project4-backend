require('dotenv').config();

// Passport strategy for authenticating with a JSON web token - Authenticates endpoints using a token
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose')
// const User = mongoose
const User = require('../models/User')


const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
    passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        // Have a user that will be found in the payload then we will check to see if the user is in the database
        User.findById(jwt_payload.id)
        .then(user => {
            // jwt_payloud is an object literal that contains the decoded JWT payload
            // 'done' is a callback that has an error first an argument done(error, user, info)
            if (user) {
                // if a user is found, return null for an error and the user
                return done(null, user)
            } else {
                // No user was found
                return done(null, false)
            }
        })
        .catch(error => console.log(error))
    }))
}