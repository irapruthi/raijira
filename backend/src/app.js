const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");

const config = require("./config/env");
const prisma = require("./config/prisma");
const redis = require("./config/redis");
const authRouter = require("./modules/auth/routes/auth.routes.js");
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

app.use((err, req, res, next) => {
    console.error(err.message);

    return res.status(500).json({
        error: err.message,
    });
});

const server = http.createServer(app);

module.exports = {
    app,
    server,
};

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});