const {
    saveCodeSnapshot,
    logCodeChange,
} = require("../../modules/editor/services/editor.service");

const prisma = require("../../config/prisma");
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

                const gameStateStr = await redis.get(`game:${gameId}:state`);
                let startedAt = null;
                if (gameStateStr) {
                    const gameState = JSON.parse(gameStateStr);
                    startedAt = gameState.startedAt ? new Date(gameState.startedAt) : null;
                }

                let elapsedMinutes = 0;
                if (startedAt) {
                    elapsedMinutes = (new Date() - startedAt) / 1000 / 60;
                }

                if (elapsedMinutes >= 18) {
                    socket.emit("error", { message: "Code is locked (Lockdown Phase)" });
                    return;
                }

                const player = await prisma.gamePlayer.findFirst({
                    where: { gameId, userId: socket.user.id }
                });

                let isInvisible = false;
                let isAnonymous = false;

                if (player && player.role === 'MAFIA') {
                    if (elapsedMinutes < 5) {
                        isInvisible = true;
                    } else if (elapsedMinutes >= 5 && elapsedMinutes < 18) {
                        isAnonymous = true;
                    }
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
                    isAnonymous: isAnonymous,
                    isInvisible: isInvisible,
                    isSilent: false,
                });

                // Do not broadcast to others if it's invisible
                if (!isInvisible) {
                    socket.to(roomCode).emit("code_sync", {
                        update,
                        filename,
                        username: isAnonymous ? "Unknown edit" : socket.user.username,
                    });
                }
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