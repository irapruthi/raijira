const dotenv = require("dotenv");

dotenv.config();

const config = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
};

for (const [key, value] of Object.entries(config)) {
    if (!value || value.trim() === "") {
        throw new Error(`Missing required env variable: ${key}`);
    }
}

module.exports = config;