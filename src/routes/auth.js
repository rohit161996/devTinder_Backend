const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcryptjs");
const authRouter = express.Router();
const User = require("../models/user");
const passport = require("passport");

authRouter.get(
    "/google",
    passport.authenticate("google",
        {
            scope: ["profile", "email"],
            session: false
        }
    )
);

authRouter.get(
    "/google/callback",
    passport.authenticate("google",
        {
            session: false,
            failureRedirect: `${process.env.FRONTEND_URL}/login`
        }
    ),
    async (req, res) => {
        try {
            const user = req.user;

            const token = await user.getJWT();

            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 8 * 3600000),
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });

            res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);

        } catch (err) {
            res.redirect(`${process.env.FRONTEND_URL}/login`)
        }
    }
);


authRouter.post("/signup",
    async (req, res) => {
        try {
            /* Validating the data */
            validateSignUpData(req);

            /* Object Destructuring */
            const { firstName, lastName, emailId, password } = req.body;

            /* Encrypting the Password */
            const passwordHash = await bcrypt.hash(password, 10);
            console.log(passwordHash);

            const user = new User({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
            });

            const savedUser = await user.save();
            const token = await savedUser.getJWT();

            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 8 * 3600000),
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.json({
                message: "User Added Successfully",
                data: savedUser,
            });
        } catch (err) {
            res.status(400).send("ERROR:" + err.message);
        }
    }
);

authRouter.post("/login",
    async (req, res) => {
        try {
            const { emailId, password } = req.body;

            /* 1. Check the email Id is valid or not? */
            const user = await User.findOne({ emailId: emailId });
            if (!user) {
                throw new Error("User with the Email id is not present in the Database");
            }

            /* For Google Authentication */
            if (user.authProvider !== "local") {
                throw new Error("Please login using Google");
            }

            /* 2. Check that the password is valid or not  */
            const isValidPassword = await user.validatePasswords(password);
            if (!isValidPassword) {
                throw new Error("Password is not valid");
            }
            else {

                /* Password is valid */
                /* 1. Create a JWT Token */
                const token = await user.getJWT();

                /* 2. Add the token to cookie and send it back to the client */
                res.cookie("token", token, { 
                    httpOnly: true, 
                    expires: new Date(Date.now() + 8 * 3600000),
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production"
                });
                res.send(user);
            }

        } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    }
);

authRouter.post("/logout",
    async (req, res) => {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.send("User has logged out successfully");
    }
);

module.exports = authRouter;
