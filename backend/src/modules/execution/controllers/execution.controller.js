const { executeCode, runTests, logExecution } = require("../services/execution.service.js");
const { checkWinConditionsAfterTest } = require("../../wincondition/services/wincondition.service.js");

function createExecutionController(io) {
    async function execute(req, res, next) {
        try {
            const { code, stdin, gameId } = req.body;
            if (!code) return res.status(400).json({ error: "Code is required" });
            const result = executeCode({ code, stdin });
            await logExecution({
                gameId,
                userId: req.user.id,
                language: "javascript",
                result,
                testsPassed: 0,
                testsFailed: 0,
            });
            return res.status(200).json(result);
        } catch (err) { next(err); }
    }

    async function test(req, res, next) {
        try {
            const { code, testCases, gameId, roomCode } = req.body;
            if (!code) return res.status(400).json({ error: "Code is required" });
            if (!testCases || !Array.isArray(testCases)) return res.status(400).json({ error: "testCases must be an array" });

            const result = await runTests({ code, testCases });

            await logExecution({
                gameId,
                userId: req.user.id,
                language: "javascript",
                result: { exitCode: 0, stdout: "", stderr: "" },
                testsPassed: result.passed,
                testsFailed: result.failed,
            });

            io.to(gameId).emit("test_result", {
                userId: req.user.id,
                username: req.user.username,
                passed: result.passed,
                failed: result.failed,
                total: result.total,
            });

            // check win conditions after every test run
            if (gameId && roomCode) {
                await checkWinConditionsAfterTest(gameId, { io, roomCode });
            }

            return res.status(200).json(result);
        } catch (err) { next(err); }
    }

    return { execute, test };
}

module.exports = { createExecutionController };