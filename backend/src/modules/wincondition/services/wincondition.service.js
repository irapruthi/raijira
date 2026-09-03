const prisma = require("../../../config/prisma.js");
const { endGame } = require("../../game/services/game.service.js");

async function checkWinConditions(gameId, { io, roomCode }) {
    const gamePlayers = await prisma.gamePlayer.findMany({
        where: {
            gameId,
        },
    });

    const alivePlayers = gamePlayers.filter(
        (player) => !player.isEliminated
    );

    const mafiaAlive = alivePlayers.filter(
        (player) =>
            player.role === "MAFIA" ||
            player.role === "SABOTEUR"
    );

    const devsAlive = alivePlayers.filter(
        (player) =>
            player.role === "DEVELOPER" ||
            player.role === "DETECTIVE" ||
            player.role === "LEAD_DEV"
    );

    // 1. All Mafia eliminated
    if (mafiaAlive.length === 0) {
        await endGame(gameId, {
            winner: "DEVELOPERS",
            winReason: "ALL_MAFIA_ELIMINATED",
            io,
            roomCode,
        });

        return {
            gameOver: true,
            winner: "DEVELOPERS",
            winReason: "ALL_MAFIA_ELIMINATED",
        };
    }

    // 2. Mafia outnumber or equal Developers
    if (mafiaAlive.length >= devsAlive.length) {
        await endGame(gameId, {
            winner: "MAFIA",
            winReason: "OUTNUMBERED",
            io,
            roomCode,
        });

        return {
            gameOver: true,
            winner: "MAFIA",
            winReason: "OUTNUMBERED",
        };
    }

    // 3. Check most recent execution log
    const latestExecution = await prisma.executionLog.findFirst({
        where: {
            gameId,
        },
        orderBy: {
            executedAt: "desc",
        },
    });

    if (
        latestExecution &&
        latestExecution.testsFailed === 0 &&
        latestExecution.testsPassed > 0
    ) {
        await endGame(gameId, {
            winner: "DEVELOPERS",
            winReason: "TESTS_PASSED",
            io,
            roomCode,
        });

        return {
            gameOver: true,
            winner: "DEVELOPERS",
            winReason: "TESTS_PASSED",
        };
    }

    return {
        gameOver: false,
    };
}

async function checkWinConditionsAfterVote(
    gameId,
    { io, roomCode }
) {
    return checkWinConditions(gameId, {
        io,
        roomCode,
    });
}

async function checkWinConditionsAfterTest(
    gameId,
    { io, roomCode }
) {
    return checkWinConditions(gameId, {
        io,
        roomCode,
    });
}

module.exports = {
    checkWinConditions,
    checkWinConditionsAfterVote,
    checkWinConditionsAfterTest,
};