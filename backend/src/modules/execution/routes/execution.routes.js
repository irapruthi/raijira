const express = require("express");

const { authenticate } = require("../../auth/middleware/auth.middleware.js");
const {
    createExecutionController,
} = require("../controllers/execution.controller.js");

function createExecutionRouter(io) {
    const router = express.Router();

    const {
        execute,
        test,
    } = createExecutionController(io);

    router.post("/execute", authenticate, execute);
    router.post("/test", authenticate, test);

    return router;
}

module.exports = createExecutionRouter;