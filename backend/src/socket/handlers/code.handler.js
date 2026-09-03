const {
    saveCodeSnapshot,
    logCodeChange,
} = require("../../modules/editor/services/editor.service");

const redis = require("../../config/redis");
function handleCodeEvents(socket, io) {
    socket.on(
        "code_sync",
        async ({
            update,
            filename,
            roomCode,
            gameId,
            diff,
            changeType,
        }) => {
            try {
                const phase = await redis.get(`game:${gameId}:phase`);
                if (phase === "LOCKDOWN") {
                    socket.emit("error", {
                        message: "Code is locked",
                    });
                    return;
                }

                await saveCodeSnapshot(
                    gameId,
                    filename,
                    update
                );

                await logCodeChange({
                    gameId,
                    userId: socket.user.id,
                    filename,
                    diff: diff || "",
                    changeType: changeType || "MODIFY",
                    isAnonymous: false,
                    isInvisible: false,
                    isSilent: false,
                });

                socket.to(roomCode).emit("code_sync", {
                    update,
                    filename,
                    username: socket.user.username,
                });
            } catch (error) {
                console.error("code_sync error:", error.message);

                socket.emit("error", {
                    message: error.message,
                });
            }
        }
    );

    // Keep your existing awareness_update handler unchanged.
    socket.on("awareness_update", (data) => {
        socket
            .to(data.roomCode)
            .emit("awareness_update", data);
    });
}

module.exports = handleCodeEvents;