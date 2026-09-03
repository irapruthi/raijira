const express = require("express");

const { authenticate } = require("../../auth/middleware/auth.middleware");

const {
    getCodeSnapshot,
    getCodeHistory,
} = require("../services/editor.service");

const router = express.Router();

router.get(
    "/games/:gameId/code/:filename",
    authenticate,
    async (req, res, next) => {
        try {
            const { gameId, filename } = req.params;

            const snapshot = await getCodeSnapshot(
                gameId,
                filename
            );

            return res.status(200).json(snapshot);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/games/:gameId/code/:filename/history",
    authenticate,
    async (req, res, next) => {
        try {
            const { gameId, filename } = req.params;

            const history = await getCodeHistory(
                gameId,
                filename
            );

            return res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;