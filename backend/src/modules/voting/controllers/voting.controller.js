const {
    startVote,
    castVote,
    resolveVote,
    getVoteStatus,
} = require("../services/voting.service.js");

function createVotingController(io) {
    async function start(req, res, next) {
        try {
            const { nominatedUserId, round } = req.body;
            const { gameId } = req.params;

            const result = await startVote({
                gameId,
                nominatedUserId,
                round: round || 1,
            });

            io.to(gameId).emit("vote_started", {
                voteRoundId: result.id,
                nominatedUserId: result.nominatedUserId,
                round: result.round,
            });

            return res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }

    async function cast(req, res, next) {
        try {
            const { voteRoundId, gamePlayerId, inFavor } = req.body;
            const voterId = req.user.id;

            const result = await castVote({
                voteRoundId,
                voterId,
                gamePlayerId,
                inFavor,
            });

            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async function resolve(req, res, next) {
        try {
            const { voteRoundId } = req.params;
            const { roomCode } = req.body;

            const result = await resolveVote({
                voteRoundId,
                io,
                roomCode,
            });

            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async function status(req, res, next) {
        try {
            const { voteRoundId } = req.params;

            const result = await getVoteStatus(voteRoundId);

            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    return {
        start,
        cast,
        resolve,
        status,
    };
}

module.exports = createVotingController;