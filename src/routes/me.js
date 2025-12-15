const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const meRouter = express.Router();

meRouter.get("/me",
    async (req, res) => {
        try {
            const token = req.cookies?.token;
            if (!token) return res.status(401).json({ user: null });

            const payload = jwt.verify(token, process.env.JWT_TOKEN_STRING);
            const user = await User.findById(payload._id).select("-password");
            return res.json({ user });
        } catch (err) {
            return res.status(401).json({ user: null });
        }
    }
);

module.exports = meRouter;
