const express = require("express");
const router = express.Router();
const stripe = require("../Payment/stripePayment");
const paypal = require("../Payment/paypal")
const razorpay = require("../Payment/razorpay");
const auth=require("../middleware/auth");


// Stripe...................
router.post("/createCustomer", stripe.createCustomer);
router.post("/payment",auth.authorization, stripe.payment);
router.get("/customerList", stripe.customerList);
router.get("/tranctionList", stripe.tranctionList);


// Paypal...............
router.post('/pay', paypal.paypal);
router.get('/success', paypal.Success);
router.get('/cancel', paypal.Cancel);

// Razorpay................
// router.post("/Razorpay",razorpay.Razorpay);
router.get('/RazorPay', (req, res) => {
    res.sendFile("/home/user/Desktop/Ecommerse/Payment/standrad.html");
})

router.post('/create/orderId',razorpay.createOrder);
router.post("/api/payment/verify",razorpay.paymentVerify) 

module.exports = router