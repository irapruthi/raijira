const express = require("express");

const {
    create,
    join,
    leave,
    get,
    list,
} = require("../controllers/rooms.controller.js");

const {
    authenticate,
} = require("../../auth/middleware/auth.middleware.js");

const router = express.Router();

router.post("/", authenticate, create);
router.post("/:roomCode/join", authenticate, join);
router.post("/:roomCode/leave", authenticate, leave);

router.get("/:roomCode", get);
router.get("/", list);

module.exports = router;