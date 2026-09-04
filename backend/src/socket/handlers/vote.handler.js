function handleVoteEvents(socket, io) {
    socket.on("vote_cast", ({ roomCode, inFavor }) => {
        io.to(roomCode).emit("vote_received", {
            voterId: socket.user.id,
            voterUsername: socket.user.username,
            inFavor: !!inFavor,
            timestamp: new Date().toISOString(),
        });
    });
}

module.exports = handleVoteEvents;