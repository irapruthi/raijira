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

module.exports = {
    register,
    login,
    guest,
    refresh,
    me,
};