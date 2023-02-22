const Razorpay = require('razorpay');


exports.Razorpay = async (req, res) => {
    try {
        const instance = new Razorpay({ key_id: 'rzp_test_VpIv0aobFnqSRX', key_secret: 'spEL5dhCobP7K5NJCrXQfRTN' })
        // console.log("ascfs");
        // let customer = await instance.customers.create({
        //     name: "Shubham Kumar",
        //     contact: 9400000001,
        //     email: "shubham@gmail.com",
        //     fail_existing: 0,
        //     // gstin: "29XAbbA4369J1PA",
        //     // notes: {
        //     //     notes_key_1: "Tea, Earl Grey, Hot",
        //     // }
        // })
        // console.log("------------->", customer);
        const b = await instance.paymentLink.create({
            amount: 5000,
            currency: "INR",
            accept_partial: true,
            first_min_partial_amount: 100,
            description: "For XYZ purpose",
            reminder_enable: true,
            notes: {
                policy_name: "Jeevan Bima"
            },
        })
        res.send(b)
        // res.send(b.short_url);
        // console.log(b.short_url);
    }
    catch (error) {
        console.log(error);
    }
}


exports.createOrder = async (req, res) => {
    try {
        console.log("in orders");
        // console.log("create orderId request", req.body);'/create/orderId'
        var options = {
            amount: 50000, // amount in the smallest currency unit
            currency: "INR",
            receipt: "rcp1"
        };
        const instance = new Razorpay({
            key_id: 'rzp_test_VpIv0aobFnqSRX',
            key_secret: 'spEL5dhCobP7K5NJCrXQfRTN'
        })
        instance.orders.create(options, function (err, order) {
            console.log(order);
            res.send({
                orderId: order.id
            })
        });
    } catch (error) {
        console.log(error);
    }
}

exports.paymentVerify = async (req, res) => {
    console.log("in verification");
    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', 'spEL5dhCobP7K5NJCrXQfRTN')
        .update(body.toString())
        .digest('hex');
    console.log("sig received ", req.body.response.razorpay_signature);
    console.log("sig generated ", expectedSignature);
    var response = { "signatureIsValid": "false" }
    if (expectedSignature === req.body.response.razorpay_signature)
        response = { "signatureIsValid": "true" }
    res.send(response);
};
