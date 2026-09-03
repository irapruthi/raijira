const express = require("express");

const { authenticate } = require("../../auth/middleware/auth.middleware");
const createRolesController = require("../controllers/roles.controller");

function createRolesRouter(io) {
    const router = express.Router();

    const {
        startGame,
        getMyRole,
    } = createRolesController(io);

    router.post(
        "/rooms/:roomId/start",
        authenticate,
        startGame
    );

    router.get(
        "/games/:gameId/my-role",
        authenticate,
        getMyRole
    );

    return router;
}

module.exports = createRolesRouter;