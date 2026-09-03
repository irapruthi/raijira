function handleRoomEvents(socket, io) {
    socket.on("join_room", ({ roomCode }) => {
        socket.join(roomCode);

        io.to(roomCode).emit("user_joined", {
            username: socket.user.username,
        });
    });

    socket.on("leave_room", ({ roomCode }) => {
        socket.leave(roomCode);

        io.to(roomCode).emit("user_left", {
            username: socket.user.username,
        });
    });
}

module.exports = handleRoomEvents;