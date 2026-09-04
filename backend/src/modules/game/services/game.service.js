const prisma = require("../../../config/prisma.js");
const redis = require("../../../config/redis.js");

async function setGamePhase(gameId, phase) {
    const key = `game:${gameId}:phase`;

    await redis.set(key, phase);

    await prisma.game.update({
        where: {
            id: gameId,
        },
        data: {
            phase,
        },
    });

    return {
        gameId,
        phase,
    };
}

async function getGamePhase(gameId) {
    const key = `game:${gameId}:phase`;

    let phase = await redis.get(key);

    if (!phase) {
        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            },
            select: {
                phase: true,
            },
        });

        if (!game) {
            throw new Error("Game not found");
        }

        phase = game.phase;

        await redis.set(key, phase);
    }

    return phase;
}

async function getGameState(gameId) {
    const key = `game:${gameId}:state`;

    const cachedState = await redis.get(key);

    if (cachedState) {
        return JSON.parse(cachedState);
    }

    const game = await prisma.game.findUnique({
        where: {
            id: gameId,
        },
        include: {
            players: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            },
            room: true,
        },
    });

    if (!game) {
        throw new Error("Game not found");
    }

    const state = {
        gameId: game.id,
        phase: game.phase,
        round: game.round,
        roomCode: game.room.roomCode,
        mode: game.room.mode,
        difficulty: game.room.difficulty,
        players: game.players.map((player) => ({
            gamePlayerId: player.id,
            userId: player.user.id,
            username: player.user.username,
            isEliminated: player.isEliminated,
            isConnected: player.isConnected,
            role: null,
        })),
        winner: null,
        winReason: null,
        startedAt: game.startedAt,
    };

    await redis.set(key, JSON.stringify(state), "EX", 3600);

    return state;
}

async function updateGameState(gameId, updates) {
    const key = `game:${gameId}:state`;

    const currentState = await getGameState(gameId);

    const updatedState = {
        ...currentState,
        ...updates,
    };

    await redis.set(key, JSON.stringify(updatedState), "EX", 3600);

    return updatedState;
}

async function setPlayerConnected(gameId, userId, isConnected) {
    await prisma.gamePlayer.update({
        where: {
            gameId_userId: {
                gameId,
                userId,
            },
        },
        data: {
            isConnected,
            disconnectedAt: isConnected ? null : new Date(),
        },
    });

    await redis.del(`game:${gameId}:state`);

    return {
        userId,
        isConnected,
    };
}

async function endGame(gameId, { winner, winReason, io, roomCode }) {
    await prisma.game.update({
        where: {
            id: gameId,
        },
        data: {
            winner,
            winReason,
            endedAt: new Date(),
            phase: "GAME_OVER",
        },
    });

    const game = await prisma.game.findUnique({
        where: {
            id: gameId,
        },
        select: {
            roomId: true,
        },
    });

    if (!game) {
        throw new Error("Game not found");
    }

    await prisma.room.update({
        where: {
            id: game.roomId,
        },
        data: {
            status: "COMPLETED",
        },
    });

    await redis.del(
        `game:${gameId}:phase`,
        `game:${gameId}:state`
    );

    const players = await prisma.gamePlayer.findMany({
        where: {
            gameId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    const finalRoles = players.map((player) => ({
        userId: player.user.id,
        username: player.user.username,
        role: player.role,
    }));

    io.to(roomCode).emit("game_over", {
        winner,
        winReason,
        finalRoles,
    });

    return {
        winner,
        winReason,
    };
}

module.exports = {
    setGamePhase,
    getGamePhase,
    getGameState,
    updateGameState,
    setPlayerConnected,
    endGame,
};