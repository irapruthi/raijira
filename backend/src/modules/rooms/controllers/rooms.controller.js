const {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    listPublicRooms,
} = require("../services/rooms.service.js");

async function create(req, res, next) {
    try {
        const {
            maxPlayers,
            mafiaCount,
            language,
            timeLimitMinutes,
            isPublic,
            mode,
            difficulty,
        } = req.body;

        const hostId = req.user.id;

        const result = await createRoom({
            hostId,
            maxPlayers,
            mafiaCount,
            language,
            timeLimitMinutes,
            isPublic,
            mode,
            difficulty,
        });

        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function join(req, res, next) {
    try {
        const { roomCode } = req.params;
        const userId = req.user.id;

        const result = await joinRoom({
            roomCode,
            userId,
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function leave(req, res, next) {
    try {
        const { roomCode } = req.params;
        const userId = req.user.id;

        const result = await leaveRoom({
            roomCode,
            userId,
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function get(req, res, next) {
    try {
        const { roomCode } = req.params;

        const result = await getRoom(roomCode);

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function list(req, res, next) {
    try {
        const result = await listPublicRooms();

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    create,
    join,
    leave,
    get,
    list,
};