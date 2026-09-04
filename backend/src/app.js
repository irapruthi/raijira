const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const path = require("path");

const config = require("./config/env");
const prisma = require("./config/prisma");
const redis = require("./config/redis");

const authRouter = require("./modules/auth/routes/auth.routes.js");
const roomsRouter = require("./modules/rooms/routes/rooms.routes.js");
const editorRouter = require("./modules/editor/routes/editor.routes.js");
const activityRouter = require("./modules/activity/routes/activity.routes.js");
const createRolesRouter = require("./modules/roles/routes/roles.routes.js");
const createExecutionRouter = require("./modules/execution/routes/execution.routes.js");
const createVotingRouter = require("./modules/voting/routes/voting.routes.js");
const createGameRouter = require("./modules/game/routes/game.routes.js");
const initSocket = require("./socket/socket.gateway");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("../frontend"));
app.use("/socket.io", express.static(path.join(__dirname, "../node_modules/socket.io/client-dist")));

// routes that don't need io
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api", editorRouter);
app.use("/api", activityRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/results", (req, res) => res.redirect("/results.html"));

const server = http.createServer(app);
const io = initSocket(server);

// routes that need io — AFTER io is defined
app.use("/api", createRolesRouter(io));
app.use("/api", createExecutionRouter(io));
app.use("/api", createVotingRouter(io));
app.use("/api", createGameRouter(io));

// error handler must be last — after all routes
app.use((err, req, res, next) => {
    console.error(err.message);
    return res.status(err.status || 500).json({ error: err.message });
});

module.exports = { app, server };

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});