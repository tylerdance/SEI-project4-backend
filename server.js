require ('dotenv').config();
const express = require('express');
const app =express();
const cors=require('cors')
//////////////new line//////////////////
// const server = require("http").createServer();
const server = require('http').Server(app)
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
});

/////////////////////////////////////////
const passport = require('passport');
const { urlencoded} =require('express');
require('./config/passport')(passport);
const PORT = process.env.PORT || 8000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
//////////////////new line///////////////////
///////////////////////////////////////////////

app.use(cors());
app.use(express.urlencoded({extend: false}));
app.use(express.json());
app.get('/', (req,res) => {
    res.status(200).json({message: 'Rome is always watching over you....'})
})
const users = require('./api/users');
app.use('/api/users', users);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

io.on("connection", (socket) => {
    // Join a conversation
    const { roomId } = socket.handshake.query;
    socket.join(roomId);
    console.log("A user is connected");
    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
      io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
    });
    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
      socket.leave(roomId);
    });
});

///////////////////////////////new line//////////////////////////////
server.listen(PORT, () => {
    console.log('Server is listening to port 8000')
})