const {
    getActivityFeed,
    logActivity,
} = require("../services/activity.service.js");

async function getFeed(req, res, next) {
    try {
        const { gameId } = req.params;

        const result = await getActivityFeed(gameId);

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function logPlayerActivity(req, res, next) {
    try {
        const { gameId } = req.params;
        const { filename, changeType, linesChanged, diff } = req.body;
        const userId = req.user.id;

        const result = await logActivity({
            gameId,
            userId,
            filename,
            changeType,
            linesChanged,
            diff,
        });

        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getFeed,
    logPlayerActivity,
};