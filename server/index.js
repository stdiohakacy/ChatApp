const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const {addUser, removeUser, getUser, getUserInRoom} = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(cors());

io.on('connect', (socket) => {
    // join
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room});
        if(error) {
            return callback(error);
        }

        socket.join(user.room);

        // norification itseft
        socket.emit('message', {
            user: 'admin', 
            text: `${user.name} welcome to room ${user.room}`
        });

        // notification broadcast
        socket.broadcast.emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
    
        callback();

    });

    // send message
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {
            user: user.name,
            text: message
        });
        callback();
    });

    // disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', {
                user: 'Admin',
                text: `${user.name} has left`
            });

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            });
        }
    });
});

app.get('/', (req, res) => {
    res.send({message: 'Hello data'}).status(200);
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server has started at port ${process.env.PORT || 3000}`);
});
