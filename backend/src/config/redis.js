const Redis = require("ioredis");

let redis;

if (globalThis.__redis) {
    redis = globalThis.__redis;
} else {
    redis = new Redis(process.env.REDIS_URL);

    redis.once("connect", () => {
        console.log("Redis connected");
    });

    redis.on("error", (err) => {
        console.error("Redis error:", err);
    });
}

if (process.env.NODE_ENV !== "production") {
    globalThis.__redis = redis;
}

module.exports = redis;