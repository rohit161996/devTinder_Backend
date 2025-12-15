const express = require("express");
require("dotenv").config();
require("./utils/cronjob");
const { connectDB } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors");
const http = require("http");
const passport = require("passport");
require("./utils/passport");

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "LOADED" : "MISSING");
console.log("BACKEND_URL:", process.env.BACKEND_URL);

app.use(passport.initialize());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/requests");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const { initializeSocket } = require("./utils/socket");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
    .then(() => {
        console.log("Database Connected Successfully");
        server.listen(3000, () => {
            console.log("Server is Up and Running");
        })
    })
    .catch(err => {
        console.error("Database cannot be connected:", err.message);
        console.error(err); // full error object for more details
        process.exit(1); // optional: stop server if DB fails
    })