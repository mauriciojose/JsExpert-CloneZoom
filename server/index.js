const server = require('http').createServer((request, response) => {
    response.writeHead(204, {
        'Acess-Control-Allow-Origin': '*',
        'Acess-Control-Allow-Methods': 'OPTIONS, POST, GET'
    });
    response.end('hey there');
});

const socketIo = require('socket.io');
const io = socketIo(server, {
    cors: {
        origin: '*',
        credentials: false
    }
});

io.on('connection', socket => {
    console.log('connection', socket.id);
    socket.on('join-room',(roomId, userId) => {
        // console.log(userId);
        // adicionar os usuarios na mesma sala
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('disconnect', () => {
            console.log('disconnected!', roomId, userId);
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });

        socket.on('message', (message) => {
            console.log('message!', message);
            socket.to(roomId).broadcast.emit('message', message);
        });

    });
});

const startServer = () => {
    const { address, port } = server.address();
    console.info(`app running at ${address}:${port}`);
};

server.listen(process.env.PORT || 3000, startServer);