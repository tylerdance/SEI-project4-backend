const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notificationsSchema = new Schema({
    from_sender: String,
    content: String,
    date: String,
    my_id: String,
    type: String,
    read: Boolean,
    pic: String,
    email: String,
    name: String,
})

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
    notifications: [notificationsSchema]
    
});

module.exports = User = mongoose.model('User', userSchema);
