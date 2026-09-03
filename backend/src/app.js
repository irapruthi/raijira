const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");

const config = require("./config/env");
const prisma = require("./config/prisma");
const redis = require("./config/redis");

const authRouter = require("./modules/auth/routes/auth.routes.js");
const roomsRouter = require("./modules/rooms/routes/rooms.routes.js");
const createRolesRouter = require("./modules/roles/routes/roles.routes.js");
const editorRouter = require("./modules/editor/routes/editor.routes.js");
const initSocket = require("./socket/socket.gateway");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("./"));

app.use("/api", editorRouter);
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

app.use((err, req, res, next) => {
    console.error(err.message);
    return res.status(err.status || 500).json({
        error: err.message,
    });
});

const server = http.createServer(app);

const io = initSocket(server);

app.use("/api", createRolesRouter(io));

module.exports = { app, server };

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});