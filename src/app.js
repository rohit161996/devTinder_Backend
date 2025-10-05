const express = require("express");
require("dotenv").config();
require("./utils/cronjob");
const { connectDB } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors");
const http = require("http");

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

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