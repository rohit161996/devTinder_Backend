/* Import the library */
const { SendEmailCommand } = require("@aws-sdk/client-ses");

/* Import the sesClient */
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress, subject, mailBody) => {
    console.log("[DEBUG] Creating SendEmailCommand...");
    console.log("  -> To Address:", toAddress);
    console.log("  -> From Address:", fromAddress);

    return new SendEmailCommand({
        Destination: {
            CcAddresses: [],
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<h1>${mailBody}</h1>`,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `Hello ${toAddress}, you have a new connection request.`,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: { subject },
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [],
    });
};

/* Actual Code to send Emails */
const run = async (subject, mailBody) => {
    console.log("[DEBUG] Preparing to send email...");

    const sendEmailCommand = createSendEmailCommand(
        "ramchandani.rohit16@gmail.com",
        "support@hksarees.com",
        subject,
        mailBody
    );

    try {
        console.log("[DEBUG] Sending email via SES...");
        const response = await sesClient.send(sendEmailCommand);
        console.log("[DEBUG] SES Response:", response);
        return response;
    } catch (caught) {
        console.error("[ERROR] Failed to send email via SES:", caught);

        if (caught instanceof Error && caught.name === "MessageRejected") {
            const messageRejectedError = caught;
            console.error("[ERROR] Message Rejected:", messageRejectedError.message);
            return messageRejectedError;
        }
        throw caught;
    }
};

module.exports = { run };
