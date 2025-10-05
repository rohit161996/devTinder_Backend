const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get(
    "/chat/:targetUserId",
    userAuth,
    async (req, res) => {
        /* It will be returning the string so we will not be 
         * destructuring the userId */
        const userId = req.user._id;
        const { targetUserId } = req.params;
        try {
            /* We will find the chat participants and the firstName and lastName 
             * of the sender of the message will be populated to know from where 
             * the message is coming from */
            let chat = await Chat.findOne({
                participants: { $all: [userId, targetUserId] },
            }).populate({
                path: "messages.senderId",
                select: "firstName lastName",
            });
            if (!chat) {
                chat = new Chat({
                    participants: [userId, targetUserId],
                    messages: [],
                });
                await chat.save();
            }
            res.json(chat);
        }
        catch (err) {
            console.log(err);
        }
    }
);

module.exports = chatRouter;