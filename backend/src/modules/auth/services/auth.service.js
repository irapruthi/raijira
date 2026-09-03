const prisma = require("../../../config/prisma.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const config = require("../../../config/env.js");

function generateTokens(user) {
    const payload = {
        id: user.id,
        username: user.username,
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
}

async function registerUser({ username, email, password }) {
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });

    if (existingUser) {
        throw new Error("Username or email already taken");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
        },
    });

    const { accessToken, refreshToken } = generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: refreshTokenHash,
        },
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
}

async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        throw new Error("Invalid credentials");
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: refreshTokenHash,
        },
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
}

async function createGuest() {
    const username = `Guest_${uuidv4().slice(0, 6)}`;

    const user = await prisma.user.create({
        data: {
            username,
            isGuest: true,
            email: null,
            passwordHash: null,
        },
    });

    const { accessToken, refreshToken } = generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);  // ADD
    await prisma.user.update({                                       // ADD
        where: { id: user.id },                                       // ADD
        data: { refreshToken: refreshTokenHash },                     // ADD
    });
    return {
        user: {
            id: user.id,
            username: user.username,
        },
        accessToken,
        refreshToken,
    };
}

async function refreshAccessToken(refreshToken) {
    let payload;

    try {
        payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error("Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.id },
    });

    if (!user || !user.refreshToken) {
        throw new Error("Invalid refresh token");
    }

    const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken
    );

    if (!refreshTokenMatches) {
        throw new Error("Invalid refresh token");
    }

    const tokens = generateTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: refreshTokenHash,
        },
    });

    return tokens;
}

module.exports = {
    generateTokens,
    registerUser,
    loginUser,
    createGuest,
    refreshAccessToken,
};