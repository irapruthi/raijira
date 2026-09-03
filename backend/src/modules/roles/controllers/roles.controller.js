const prisma = require("../../../config/prisma");
const {
    assignRoles,
    getRoomRoles,
} = require("../services/roles.service");

function createRolesController(io) {
    async function startGame(req, res, next) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;

            const room = await prisma.room.findUnique({
                where: {
                    id: roomId,
                },
            });

            if (!room) {
                const error = new Error("Room not found");
                error.status = 404;
                throw error;
            }

            if (room.hostId !== userId) {
                const error = new Error("Only host can start the game");
                error.status = 403;
                throw error;
            }

            const result = await assignRoles(roomId, io);

            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async function getMyRole(req, res, next) {
        try {
            const { gameId } = req.params;
            const userId = req.user.id;

            const result = await getRoomRoles(gameId, userId);

            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    return {
        startGame,
        getMyRole,
    };
}

module.exports = createRolesController;