const prisma = require("../../../config/prisma");

/**
 * Fisher-Yates shuffle.
 */
function shufflePlayers(players) {
    const shuffled = [...players];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Build the role list for a room.
 */
function getRolesForRoom(room) {
    const playerCount = room.players.length;
    const mafiaCount = room.mafiaCount;

    if (room.mode === "GHOST" && playerCount === 4) {
        return [
            "MAFIA",
            "DEVELOPER",
            "DEVELOPER",
            "DEVELOPER",
        ];
    }

    if (room.mode === "SOCIAL_DEDUCTION") {
        switch (playerCount) {
            case 4:
                return [
                    "MAFIA",
                    "DEVELOPER",
                    "DEVELOPER",
                    "DEVELOPER",
                ];

            case 6:
                return [
                    "MAFIA",
                    "SABOTEUR",
                    "DETECTIVE",
                    "DEVELOPER",
                    "DEVELOPER",
                    "DEVELOPER",
                ];

            case 8:
                return [
                    "MAFIA",
                    "MAFIA",
                    "SABOTEUR",
                    "DETECTIVE",
                    "LEAD_DEV",
                    "DEVELOPER",
                    "DEVELOPER",
                    "DEVELOPER",
                ];

            case 10:
                return [
                    "MAFIA",
                    "MAFIA",
                    "MAFIA",
                    "SABOTEUR",
                    "DETECTIVE",
                    "LEAD_DEV",
                    "DEVELOPER",
                    "DEVELOPER",
                    "DEVELOPER",
                    "DEVELOPER",
                ];

            default:
                return [
                    ...Array(mafiaCount).fill("MAFIA"),
                    ...Array(playerCount - mafiaCount).fill("DEVELOPER"),
                ];
        }
    }

    if (room.mode === "RACE") {
        return [
            ...Array(mafiaCount).fill("MAFIA"),
            ...Array(playerCount - mafiaCount).fill("DEVELOPER"),
        ];
    }

    return [
        ...Array(mafiaCount).fill("MAFIA"),
        ...Array(playerCount - mafiaCount).fill("DEVELOPER"),
    ];
}

async function assignRoles(roomId, io) {
    const room = await prisma.room.findUnique({
        where: {
            id: roomId,
        },
        include: {
            players: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!room) {
        throw new Error("Room not found");
    }

    if (room.players.length < 2) {
        throw new Error("Need at least 2 players to start");
    }

    if (room.players.length < room.mafiaCount + 1) {
        throw new Error("Not enough players for this mafia count");
    }

    const shuffledPlayers = shufflePlayers(room.players);
    const roles = getRolesForRoom(room);

    const game = await prisma.game.create({
        data: {
            roomId,
            phase: "CODING",
            startedAt: new Date(),
        },
    });

    const assignedPlayers = shuffledPlayers.map((player, index) => ({
        ...player,
        assignedRole: roles[index],
    }));

    await prisma.$transaction([
        ...assignedPlayers.map((player) =>
            prisma.gamePlayer.update({
                where: {
                    id: player.id,
                },
                data: {
                    role: player.assignedRole,
                    gameId: game.id,
                },
            })
        ),

        prisma.room.update({
            where: {
                id: roomId,
            },
            data: {
                status: "IN_PROGRESS",
            },
        }),
    ]);

    for (const player of assignedPlayers) {
        io.to(player.userId).emit("role_assigned", {
            role: player.assignedRole,
        });
    }

    io.to(room.roomCode).emit("game_started", {
        gameId: game.id,
        phase: "CODING",
        players: assignedPlayers.map((player) => ({
            userId: player.userId,
            username: player.user.username,
            role: null,
        })),
    });

    return {
        gameId: game.id,
        phase: "CODING",
    };
}

async function getRoomRoles(gameId, requestingUserId) {
    const players = await prisma.gamePlayer.findMany({
        where: {
            gameId,
        },
        include: {
            user: true,
        },
    });

    const requestingPlayer = players.find(
        (player) => player.userId === requestingUserId
    );

    return {
        myRole: requestingPlayer ? requestingPlayer.role : null,
        players: players.map((player) => ({
            userId: player.userId,
            username: player.user.username,
            role: null,
        })),
    };
}

module.exports = {
    assignRoles,
    getRoomRoles,
};