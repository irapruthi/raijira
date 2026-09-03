const Redis = require("ioredis");

let redis;

if (globalThis.__redis) {
    redis = globalThis.__redis;
} else {
    redis = new Redis(process.env.REDIS_URL, {
        tls: {
            rejectUnauthorized: false
        },
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) return null;
            return Math.min(times * 200, 1000);
        }
    });

    redis.once("connect", () => {
        console.log("Redis connected");
    });

    redis.on("error", (err) => {
        console.error("Redis error:", err.message);
    });
}

if (process.env.NODE_ENV !== "production") {
    globalThis.__redis = redis;
}

module.exports = redis;