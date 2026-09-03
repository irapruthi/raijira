const express = require("express");

const { authenticate } = require("../../auth/middleware/auth.middleware.js");
const createGameController = require("../controllers/game.controller.js");

function createGameRouter(io) {
    const router = express.Router();

    const {
        getState,
        setPhase,
        end,
    } = createGameController(io);

    router.get("/games/:gameId/state", authenticate, getState);
    router.post("/games/:gameId/phase", authenticate, setPhase);
    router.post("/games/:gameId/end", authenticate, end);

    return router;
}

module.exports = createGameRouter;