async function ensureAuth() {
    // try refresh first
    const stored = localStorage.getItem("cm_token");
    const refresh = localStorage.getItem("cm_refresh");
    if (stored && refresh) {
        const newToken = await refreshToken();
        if (newToken) {
            authToken = newToken;
            currentUser = JSON.parse(localStorage.getItem("cm_user") || "null");
            return;
        }
    }
    // fresh guest login
    try {
        const res = await API.guest();
        authToken = res.accessToken;
        currentUser = res.user;
        localStorage.setItem("cm_token", authToken);
        localStorage.setItem("cm_refresh", res.refreshToken);
        localStorage.setItem("cm_user", JSON.stringify(currentUser));
        console.log("Logged in as guest:", currentUser.username);
    } catch (err) {
        console.error("Auth failed:", err);
        toast("BACKEND OFFLINE — running in demo mode", "err");
    }
}


const API = {
    // AUTH
    guest: () =>
        fetch(`${CONFIG.API_URL}/auth/guest`, { method: "POST" }).then(r => r.json()),

    login: (email, password) =>
        fetch(`${CONFIG.API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }).then(r => r.json()),

    // ROOMS
    createRoom: (data, token) =>
        fetch(`${CONFIG.API_URL}/rooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        }).then(r => r.json()),

    joinRoom: (roomCode, token) =>
        fetch(`${CONFIG.API_URL}/rooms/${roomCode}/join`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),

    // GAME
    startGame: (roomId, token) =>
        fetch(`${CONFIG.API_URL}/rooms/${roomId}/start`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),

    runTests: (gameId, code, testCases, roomCode, token) =>
        fetch(`${CONFIG.API_URL}/test`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ gameId, code, testCases, roomCode }),
        }).then(r => r.json()),
};