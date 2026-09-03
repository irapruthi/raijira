const express = require("express");
const {
    register,
    login,
    guest,
    refresh,
    me,
} = require("../controllers/auth.controller.js");
const {
    authenticate,
} = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/guest", guest);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);

module.exports = router;