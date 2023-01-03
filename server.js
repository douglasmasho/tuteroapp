//import express
const config = require('dotenv').config()
const path = require('path');
const express = require("express");
const app = express();
const PORT = process.env.port || 5000; 

// ** MIDDLEWARE ** //
const whitelist = ['http://localhost:5000', 'http://localhost:8080'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
  
}


if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }

const publicPath = path.join(__dirname, 'client', 'build');
app.use(express.static(publicPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
 });

  const server = app.listen(PORT, ()=>{
    console.log(`the server is running on port: ${PORT}`);
})


//reuire socket io
const socket = require("socket.io");

//create the io
const io = socket(server);

//create rooms

const rooms = {

}

const users = [];

const userRooms = {

}


//listen for a connection
io.on("connection", socket=>{
    console.log(`the socket ${socket.id} has connected`);
    console.log(users);
    //listen to a message from the socket
     //get them to join a room and store it somewhere(firebase)
     socket.on("new user", (userObj)=>{
        //  console.log(userObj);
        //return the usersArray to the user
        socket.emit("existing users", users)
        //add the user object to the array.
        users.push(userObj);
     })


     socket.on("join room", roomName=>{
         //check if the room exists in the records
         if(rooms[roomName]){
         //if it exists, first  make sure the length does not exceed 2
            rooms[roomName].push(socket.id);
            socket.join(roomName);
         }else{
             rooms[roomName] = [socket.id];
             socket.join(roomName);
         }
        //record the user's room
        userRooms[socket.id] = roomName;
        //respond with the other users in the room
        const otherUsers = rooms[roomName].filter(id=> id !== socket.id);
        socket.emit("other users", otherUsers);
     })

     socket.on("message", message=>{
         const roomID = userRooms[socket.id];
         console.log(message);
         //send this message back to the room
         io.to(roomID).emit("message", message);
     })

     socket.on("delete message", msgObj=>{
            socket.broadcast.emit("delete message", msgObj);

     })
})




