const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')

paymentRouter.post(
    "/payment/create",
    userAuth,
    async (req, res) => {
        try {
            const { membershipType } = req.body;
            const { firstName, lastName, emailId } = userAuth;
            const order = await razorpayInstance.orders.create({
                amount: membershipAmount[membershipType] * 100,
                currency: "INR",
                notes: {
                    firstName: firstName,
                    lastName: lastName,
                    emailId: emailId,
                    membershipType: membershipType,
                },
            });

            /* Save it in the Database */
            const payment = new Payment({
                userId: req.user._id,
                orderId: order.id,
                status: order.status,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                notes: order.notes
            });
            const savedPayment = await payment.save();

            /* Return back my order details to Frontend */
            res.json({
                // order
                ...savedPayment.toJSON(),
                keyId: process.env.RAZORPAY_KEY_ID,
            });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
);

paymentRouter.post(
    "/payment/webhook",
    async (req, res) => {
        try {
            const webhookSignature = req.get["X-Razorpay-Signature"];

            /* This is the main line which will validate the web hook signature */
            const isWebHookValid = validateWebhookSignature(
                JSON.stringify(req.body),
                webhookSignature,
                process.env.RAZORPAY_WEBHOOK_SECRET
            );

            if (!isWebHookValid) {
                return res.status(400).json({ msg: "Notebook signature is invalid" });
            }

            /* Update my payment status in the Database */
            const paymentDetails = req.body.payload.payment.entity;
            const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
            payment.status = paymentDetails.status;
            await payment.save();

            const user = await User.findOne({ _id: payment.userId });
            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save();

            /* Update the user as premium 
             * Captured = Success
             * Failed = failed
             */
            if (req.body.event == "payment.captured") {

            }

            if (req.body.event == "payment.failed") {

            }

            /* Return the success response to the Razorpay */
            return res.status(200).json({ msg: "Webhook received successfully" });
        }
        catch (err) {
            res.status(500).json({ msg: err.message });
        }
    }
);

module.exports = paymentRouter;