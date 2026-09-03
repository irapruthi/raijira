const prisma = require("../../../config/prisma.js");
const { checkWinConditionsAfterVote } = require("../../wincondition/services/wincondition.service.js");

async function startVote({ gameId, nominatedUserId, round }) {
    const activeVote = await prisma.voteRound.findFirst({
        where: { gameId, endTime: null },
    });

    if (activeVote) {
        throw new Error("A vote is already in progress");
    }

    const voteRound = await prisma.voteRound.create({
        data: {
            gameId,
            round,
            nominatedUserId,
            startTime: new Date(),
        },
    });

    return voteRound;
}

async function castVote({ voteRoundId, voterId, gamePlayerId, inFavor }) {
    const voteRound = await prisma.voteRound.findUnique({
        where: { id: voteRoundId },
    });

    if (!voteRound) throw new Error("Vote round not found");
    if (voteRound.endTime !== null) throw new Error("Vote has already ended");

    const existingVote = await prisma.vote.findFirst({
        where: { voteRoundId, voterId },
    });

    if (existingVote) throw new Error("Already voted");

    const vote = await prisma.vote.create({
        data: { voteRoundId, voterId, gamePlayerId, inFavor },
    });

    return vote;
}

async function resolveVote({ voteRoundId, io, roomCode }) {
    const voteRound = await prisma.voteRound.findUnique({
        where: { id: voteRoundId },
        include: { votes: true },
    });

    if (!voteRound) throw new Error("Vote round not found");

    const inFavorCount = voteRound.votes.filter((v) => v.inFavor === true).length;
    const againstCount = voteRound.votes.filter((v) => v.inFavor === false).length;
    const total = voteRound.votes.length;

    let result;

    if (inFavorCount > total / 2) {
        result = "ELIMINATED";

        await prisma.gamePlayer.updateMany({
            where: {
                gameId: voteRound.gameId,
                userId: voteRound.nominatedUserId,
            },
            data: {
                isEliminated: true,
                isRevealed: true,
            },
        });
    } else {
        result = "SPARED";
    }

    await prisma.voteRound.update({
        where: { id: voteRoundId },
        data: { endTime: new Date(), result },
    });

    io.to(roomCode).emit("vote_result", {
        nominatedUserId: voteRound.nominatedUserId,
        result,
        inFavor: inFavorCount,
        against: againstCount,
    });

    // check win conditions after every vote resolution
    await checkWinConditionsAfterVote(voteRound.gameId, { io, roomCode });

    return {
        result,
        nominatedUserId: voteRound.nominatedUserId,
    };
}

async function getVoteStatus(voteRoundId) {
    const voteRound = await prisma.voteRound.findUnique({
        where: { id: voteRoundId },
        include: { votes: true },
    });

    if (!voteRound) throw new Error("Vote round not found");

    const inFavor = voteRound.votes.filter((v) => v.inFavor === true).length;
    const against = voteRound.votes.filter((v) => v.inFavor === false).length;

    return {
        voteRoundId: voteRound.id,
        nominatedUserId: voteRound.nominatedUserId,
        inFavor,
        against,
        total: voteRound.votes.length,
        ended: voteRound.endTime !== null,
        result: voteRound.result,
    };
}

module.exports = {
    startVote,
    castVote,
    resolveVote,
    getVoteStatus,
};