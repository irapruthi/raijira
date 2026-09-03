function handleVoteEvents(socket, io) {
    socket.on("vote_cast", ({ roomCode, targetUserId }) => {
        io.to(roomCode).emit("vote_received", {
            voterId: socket.user.id,
            voterUsername: socket.user.username,
            targetUserId,
            timestamp: new Date().toISOString(),
        });
    });
}

module.exports = handleVoteEvents;