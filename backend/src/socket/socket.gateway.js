const { Server } = require("socket.io");

const socketAuth = require("./middleware/socket.auth");

const handleRoomEvents = require("./handlers/room.handler");
const handleCodeEvents = require("./handlers/code.handler");
const handleChatEvents = require("./handlers/chat.handler");
const handleVoteEvents = require("./handlers/vote.handler");

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.use(socketAuth);

    io.on("connection", (socket) => {
        console.log("User connected: " + socket.user.username);
        handleRoomEvents(socket, io);
        handleRoomEvents(socket, io);
        handleCodeEvents(socket, io);
        handleChatEvents(socket, io);
        handleVoteEvents(socket, io);

        socket.on("disconnect", () => {
            console.log("User disconnected: " + socket.user.username);
        });
    });

    return io;
}

module.exports = initSocket;