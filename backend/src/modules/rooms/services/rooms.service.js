const prisma = require("../../../config/prisma.js");

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

async function generateUniqueRoomCode() {
    let roomCode;
    let existingRoom;

    do {
        roomCode = Array.from({ length: 6 }, () =>
            ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
        ).join('');

        existingRoom = await prisma.room.findUnique({
            where: { roomCode },
        });
    } while (existingRoom);

    return roomCode;
}

async function createRoom({
    hostId,
    maxPlayers,
    mafiaCount,
    language,
    timeLimitMinutes,
    isPublic,
    mode,
    difficulty,
}) {
    const roomCode = await generateUniqueRoomCode();

    const room = await prisma.$transaction(async (tx) => {
        const createdRoom = await tx.room.create({
            data: {
                roomCode,
                hostId,
                maxPlayers,
                mafiaCount,
                language,
                timeLimitMinutes,
                isPublic,
                mode,
                difficulty,
                status: "WAITING",
            },
        });

        await tx.gamePlayer.create({
            data: {
                userId: hostId,
                roomId: createdRoom.id,
            },
        });

        return tx.room.findUnique({
            where: {
                id: createdRoom.id,
            },
            include: {
                players: true,
            },
        });
    });

    return room;
}

async function joinRoom({ roomCode, userId }) {
    const room = await prisma.room.findUnique({
        where: {
            roomCode,
        },
    });

    if (!room) {
        throw new Error("Room not found");
    }

    if (room.status !== "WAITING") {
        throw new Error("Game already in progress");
    }

    const playerCount = await prisma.gamePlayer.count({
        where: {
            roomId: room.id,
        },
    });

    if (playerCount >= room.maxPlayers) {
        throw new Error("Room is full");
    }

    const existingPlayer = await prisma.gamePlayer.findFirst({
        where: {
            roomId: room.id,
            userId,
        },
    });

    if (existingPlayer) {
        throw new Error("Already in this room");
    }

    await prisma.gamePlayer.create({
        data: {
            roomId: room.id,
            userId,
        },
    });

    return prisma.room.findUnique({
        where: {
            id: room.id,
        },
        include: {
            players: true,
        },
    });
}

async function leaveRoom({ roomCode, userId }) {
    const room = await prisma.room.findUnique({
        where: {
            roomCode,
        },
    });

    if (!room) {
        throw new Error("Room not found");
    }

    const player = await prisma.gamePlayer.findFirst({
        where: {
            roomId: room.id,
            userId,
        },
    });

    if (player) {
        await prisma.gamePlayer.delete({
            where: {
                id: player.id,
            },
        });
    }

    if (room.hostId === userId) {
        const remainingPlayers = await prisma.gamePlayer.findMany({
            where: {
                roomId: room.id,
            },
            orderBy: {
                id: "asc",
            },
        });

        if (remainingPlayers.length === 0) {
            await prisma.room.delete({
                where: {
                    id: room.id,
                },
            });
        } else {
            await prisma.room.update({
                where: {
                    id: room.id,
                },
                data: {
                    hostId: remainingPlayers[0].userId,
                },
            });
        }
    }

    return {
        message: "Left room successfully",
    };
}

async function getRoom(roomCode) {
    const room = await prisma.room.findUnique({
        where: {
            roomCode,
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
        },
    });

    if (!room) {
        throw new Error("Room not found");
    }

    return room;
}

async function listPublicRooms() {
    return prisma.room.findMany({
        where: {
            isPublic: true,
            status: "WAITING",
        },
        include: {
            _count: {
                select: {
                    players: true,
                },
            },
        },
    });
}

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    listPublicRooms,
};