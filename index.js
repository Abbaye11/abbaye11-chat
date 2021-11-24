const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var connectedUsers = [];


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/userexist', (req, res) => {

    var username = req.query.username
    
    if(username === undefined){
        res.status(422);
        res.send('Paramter username missing')
    }

    var userFind = userConnected(username);

    if(userFind){
        res.status(200)
        res.send('User ' + username + " exist")
    }else{
        res.status(404)
        res.send('User ' + username + " don't exist")
    }

});


app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

setInterval(function () {

    console.log("update users status")
    io.emit('still-alive');
    connectedUsers = []

},5000)

io.on('connection', (socket) => {  
    
    

    socket.on('user-connected', (connectedUser) => {    
        console.log('a user connected:' + connectedUser.username);

        connectedUsers.push(connectedUser)

        io.emit('users-updated', connectedUsers);

        
    });

    socket.on('chat-message', (msg) => {    
        console.log('message: ' + msg + ", from:" + msg.user);  
        io.emit('chat-message', msg);
    });

    socket.on('disconnect', (msg) => {    
        console.log('user disconnected');  
    });

    socket.on('user-disconnected', (msg) => {

        for( var i = 0; i < connectedUsers.length; i++){ 
    
            if ( connectedUsers[i].username === msg.username) { 
        
                connectedUsers.splice(i, 1); 
                
            }
        }

        console.log(connectedUsers.length)

        io.emit('users-updated', connectedUsers);        

    });


    socket.on('alive', (msg) => {    
        console.log('alive: ' + msg);
          
        connectedUsers.push(msg)

        io.emit('users-updated', connectedUsers);
        
    });

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

var userConnected = function (username) {

    var userFind = connectedUsers.find(user => user.username === username);

    return userFind !== undefined;

} 