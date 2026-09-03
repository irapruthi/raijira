const express = require("express");

const { authenticate } = require("../../auth/middleware/auth.middleware.js");
const {
    getFeed,
    logPlayerActivity,
} = require("../controllers/activity.controller.js");

const router = express.Router();

router.get(
    "/games/:gameId/activity",
    authenticate,
    getFeed
);

router.post(
    "/games/:gameId/activity",
    authenticate,
    logPlayerActivity
);

module.exports = router;