const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequestModel = require("../models/connectionRequest");

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
            async ({ firstName, lastName, userId, targetUserId, text }) => {
                try {
                    /* Create the room Id for the two users */
                    const roomId = getSecretRoomId(userId, targetUserId);
                    console.log(firstName + " " + lastName + " " + text);


                    /* Check if the userId and the targetId are friends */
                    // const existingConnectionRequest = await ConnectionRequestModel.findOne({
                    //     $or: [
                    //         { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
                    //         { fromUserId: toUserId, toUserId: fromUserId }
                    //     ],
                    // });

                    /* Save the message to the database */
                    /* Find all the people that are in the chat */
                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });

                    /* Create a new chat object if the chat object is empty */
                    if (!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            messages: [],
                        });
                    }

                    /* Add the messages to the chat object */
                    chat.messages.push({
                        senderId: userId,
                        text: text,
                    });

                    /* Save the chat object to the database */
                    await chat.save();

                    /* Send the message to the room using the room id */
                    io.to(roomId).emit("messageReceived", { firstName, lastName, text });
                }
                catch (err) {
                    console.log(err.message);
                }

            });

        socket.on("disconnect", () => {

        });
    });
}

module.exports = { initializeSocket };