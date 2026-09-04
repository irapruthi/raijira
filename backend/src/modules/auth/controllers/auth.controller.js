const {
    registerUser,
    loginUser,
    createGuest,
    refreshAccessToken,
} = require("../services/auth.service.js");

async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;

        const result = await registerUser({
            username,
            email,
            password,
        });

        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const result = await loginUser({
            email,
            password,
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function guest(req, res, next) {
    try {
        const result = await createGuest();
        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: "Refresh token required",
            });
        }

        const result = await refreshAccessToken(refreshToken);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

function me(req, res, next) {
    return res.status(200).json({
        user: req.user,
    });
}

async function updateMe(req, res, next) {
    try {
        const prisma = require("../../../config/prisma.js");
        const { username } = req.body;
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: "username required" });
        }
        const trimmed = username.trim().slice(0, 32);
        if (!trimmed) return res.status(400).json({ error: "username required" });

        const existing = await prisma.user.findFirst({
            where: { username: trimmed, NOT: { id: req.user.id } },
        });
        if (existing) return res.status(409).json({ error: "Username taken" });

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { username: trimmed },
            select: { id: true, username: true },
        });
        return res.status(200).json({ user: updated });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    register,
    login,
    guest,
    refresh,
    me,
    updateMe,
};