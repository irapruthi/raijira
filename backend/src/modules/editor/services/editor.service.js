const prisma = require("../../../config/prisma");
const redis = require("../../../config/redis");

async function getCodeSnapshot(gameId, filename) {
    const key = `code:${gameId}:${filename}`;

    const content = await redis.get(key);

    if (content === null) {
        return {
            filename,
            content: "",
            gameId,
        };
    }

    return {
        filename,
        content,
        gameId,
    };
}

async function saveCodeSnapshot(gameId, filename, content) {
    const key = `code:${gameId}:${filename}`;

    await redis.set(key, content);

    return {
        saved: true,
    };
}

async function logCodeChange({
    gameId,
    userId,
    filename,
    diff,
    changeType,
    isAnonymous = false,
    isInvisible = false,
    isSilent = false,
    problemId,
}) {
    const codeChange = await prisma.codeChange.create({
        data: {
            gameId,
            userId,
            filename,
            diff,
            changeType,
            isAnonymous,
            isInvisible,
            isSilent,
            problemId,
        },
    });

    return codeChange;
}

async function getCodeHistory(gameId, filename) {
    const history = await prisma.codeChange.findMany({
        where: {
            gameId,
            filename,
        },
        orderBy: {
            timestamp: "asc",
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    return history;
}

async function initGameFiles(gameId, filenames) {
    for (const filename of filenames) {
        const key = `code:${gameId}:${filename}`;

        const exists = await redis.exists(key);

        if (!exists) {
            await redis.set(key, "");
        }
    }

    return {
        initialized: filenames,
    };
}

module.exports = {
    getCodeSnapshot,
    saveCodeSnapshot,
    logCodeChange,
    getCodeHistory,
    initGameFiles,
};