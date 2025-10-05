const socket = require("socket.io");

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
                const roomId = [userId, targetUserId].sort().join("_");

                /* Join the room with the id for the users */
                socket.join(roomId);
            });

        socket.on(
            "sendMessage",
            ({ firstName, userId, targetUserId, text }) => {
                /* Create the room Id for the two users */
                const roomId = [userId, targetUserId].sort().join("_");
                console.log(firstName + " " + text);

                /* Send the message to the room using the room id */
                io.to(roomId).emit("messageReceived", {firstName, text});
            });

        socket.on("disconnect", () => {

        });
    });
}

module.exports = { initializeSocket };