function handleChatEvents(socket, io) {
    socket.on("chat_message", ({ message, roomCode }) => {
        io.to(roomCode).emit("chat_message", {
            message,
            username: socket.user.username,
            timestamp: new Date().toISOString(),
        });
    });
}

module.exports = handleChatEvents;