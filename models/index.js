require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
});

const db = mongoose.connection;
// console.log(db);

// Event listener that will fire once the connection opens for the db & log host and port
db.once('open', () => {
    console.log(`Connected to MongoDB at ${db.host}:${db.port}`);
})

db.on('error', (error) => {
    console.log(`Database error\n ${error}`);
})

module.exports.User = require('./User')