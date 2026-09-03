const vm = require("vm");
const prisma = require("../../../config/prisma.js");

function executeCode({ code, stdin }) {
    const output = [];

    const sandbox = {
        console: {
            log: (...args) => output.push(args.join(" ")),
        },
        input: stdin || "",
    };

    try {
        vm.runInNewContext(code, sandbox, {
            timeout: 5000,
        });

        return {
            stdout: output.join("\n"),
            stderr: "",
            exitCode: 0,
            status: "Success",
        };
    } catch (err) {
        return {
            stdout: "",
            stderr: err.message,
            exitCode: 1,
            status: "Error",
        };
    }
}

async function runTests({ code, testCases }) {
    const results = [];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        const result = executeCode({
            code,
            stdin: testCase.input,
        });

        const output = result.stdout.trim();
        const expected = testCase.expectedOutput.trim();

        const status = output === expected ? "PASS" : "FAIL";

        if (status === "PASS") {
            passed++;
        } else {
            failed++;
        }

        results.push({
            testId: testCase.id,
            status,
            output,
            expected,
        });
    }

    return {
        passed,
        failed,
        total: testCases.length,
        results,
    };
}

async function logExecution({
    gameId,
    userId,
    language,
    result,
    testsPassed,
    testsFailed,
}) {
    const log = await prisma.executionLog.create({
        data: {
            gameId,
            userId,
            exitCode: result.exitCode,
            stdout: result.stdout || "",
            stderr: result.stderr || "",
            language: language || "javascript",
            testsPassed: testsPassed || 0,
            testsFailed: testsFailed || 0,
        },
    });

    return log;
}

module.exports = {
    executeCode,
    runTests,
    logExecution,
};