function handleRoomEvents(socket, io) {
    socket.on("join_room", ({ roomCode }) => {
        socket.join(roomCode);

        // broadcast to others only — the joiner already knows they joined
        socket.to(roomCode).emit("user_joined", {
            username: socket.user.username,
        });
    });

    socket.on("leave_room", ({ roomCode }) => {
        socket.leave(roomCode);

        socket.to(roomCode).emit("user_left", {
            username: socket.user.username,
        });
    });
}

module.exports = handleRoomEvents;