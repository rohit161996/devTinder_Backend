const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

cron.schedule("15 11 * * *", async () => {

    // console.log("Hello World " + new Date());

    /* Send Email to all people who got a request the previous day. */
    try {

        const yesterday = subDays(new Date(), 1);

        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequest = await ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd,
            },
        }).populate("fromUserId toUserId");

        /* We will get the emailId with the help of the map and get 
           them in the set to get the unique ids, then convert the 
           email ids in the array using the spread operator
        */
        const listOfEmails = [
            ...new Set(pendingRequest.map((req => req.toUserId.emailId)))
        ];

        console.log(listOfEmails);

        for (const email of listOfEmails) {
            /* Send the emails */
            try {
                const res = await sendEmail.run(
                    "New Friend Requests pending for " + email, 
                    "There are so many requests pending, please login to devTinder.in and accept or reject the requests"
                );
                console.log(res);
            }
            catch (err) {
                console.log("ERROR:", err.message);
            }
        }

        if (listOfEmails.length === 0) {
            const res = await sendEmail.run(
                "New Friend Requests pending, There are so many requests pending, please login to devTinder.in and accept or reject the requests"
            );
            console.log(res);
        }

    } catch (err) {
        console.log("ERROR MESSAGE: " + err);
    }
});