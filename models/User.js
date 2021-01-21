const mongoose = require('mongoose')
const Schema = mongoose.Schema

// User schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    },
    bio: {
        type: String,
    },
    preference: {
        type: String,
    },
    image_url: String,
    date: {
        type: Date,
        default: Date.now()
    },
    
});

module.exports = User = mongoose.model('User', userSchema);
