const express = require("express");

const { authenticate } = require("../../auth/middleware/auth.middleware.js");
const createVotingController = require("../controllers/voting.controller.js");

function createVotingRouter(io) {
    const router = express.Router();

    const {
        start,
        cast,
        resolve,
        status,
    } = createVotingController(io);

    router.post(
        "/games/:gameId/vote/start",
        authenticate,
        start
    );

    router.post(
        "/games/:gameId/vote/cast",
        authenticate,
        cast
    );

    router.post(
        "/vote/:voteRoundId/resolve",
        authenticate,
        resolve
    );

    router.get(
        "/vote/:voteRoundId/status",
        authenticate,
        status
    );

    return router;
}

module.exports = createVotingRouter;