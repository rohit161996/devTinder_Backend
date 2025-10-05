const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
}


const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        /* Handle the Events */
        socket.on(
            "joinChat",
            ({ firstName, userId, targetUserId }) => {
                /* Create the room Id for the two users */
                const roomId = getSecretRoomId(userId, targetUserId);

                /* Join the room with the id for the users */
                socket.join(roomId);
            });

        socket.on(
            "sendMessage",
            ({ firstName, userId, targetUserId, text }) => {
                /* Create the room Id for the two users */
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(firstName + " " + text);

                /* Send the message to the room using the room id */
                io.to(roomId).emit("messageReceived", { firstName, text });
            });

        socket.on("disconnect", () => {

        });
    });
}

module.exports = { initializeSocket };