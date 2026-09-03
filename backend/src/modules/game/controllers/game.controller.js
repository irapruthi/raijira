const {
    getGameState,
    setGamePhase,
    endGame,
} = require("../services/game.service.js");

function createGameController(io) {
    async function getState(req, res, next) {
        try {
            const { gameId } = req.params;

            const state = await getGameState(gameId);

            return res.status(200).json(state);
        } catch (error) {
            next(error);
        }
    }

    async function setPhase(req, res, next) {
        try {
            const { gameId } = req.params;
            const { phase } = req.body;

            const result = await setGamePhase(gameId, phase);

            io.to(gameId).emit("phase_changed", {
                gameId,
                phase,
            });

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async function end(req, res, next) {
        try {
            const { gameId } = req.params;
            const { winner, winReason, roomCode } = req.body;

            const result = await endGame(gameId, {
                winner,
                winReason,
                io,
                roomCode,
            });

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    return {
        getState,
        setPhase,
        end,
    };
}

module.exports = createGameController;