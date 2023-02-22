const order = require("../Models/order");
const customer = require("../service/customer");
const CustomerTable = require("../Models/customer")
const paymentDetail = require("../Models/paymentDetail");

const stripe = require("stripe")("sk_test_51LefD4SB9wCPYaiocvXXwTqETtbjQJCCPlwcXWp2Z4PraPu6ZWR4z9aNte0IbPOqCA70AasjOGsOteSp4FN3ufQ300eV6Snyr4");


exports.createCustomer = async (req, res, next) => {
    try {
        const customer = await stripe.customers.create({
            name: req.body.name,
            email: req.body.email,
        });
        return res.send({
            status: 200,
            message: "Customer successfully creted",
            data: customer
        })
        // res.status(200).send(customer);
    } catch (error) {
        console.log(error);
        return res.json({
            staus: 500,
            message: "Catch error"
        })

    }
}

exports.customerList = async (req, res, next) => {
    try {
        const CustomerList = await stripe.customers.list({})
        if (CustomerList) {
            return res.json({
                status: 200,
                message: "Customers List fetched successfully",
                data: CustomerList
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            statu: 500,
            message: "catch error",
            data: error.message
        })

    }
}

exports.payment = async function (req, res, next) {
    try {
        let paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                // number: "4242424242424242",
                number: req.body.number,
                exp_month: 9,
                exp_year: 2022,
                cvc: "314"
            },
        });
        const orderDetail = await order.findAll({
            where: { id: req.body.id }
        })
        let amount = orderDetail[0].TotalPayableAmount

        const exCustomer = await CustomerTable.findAll({
            where: { id: req.id }
        })
        const Customer = await stripe.customers.create({
            name: exCustomer[0].name,
            email: exCustomer[0].email
        })
        console.log(req.id);
        paymentIntent = await stripe.paymentIntents.create({
            payment_method: paymentMethod.id,
            amount: amount ,//* 100,
            customer:Customer.id,
            // amount: 40 * 100, // USD*100
            currency: 'inr',
            confirm: true,
            payment_method_types: ['card'],
            off_session: true            //using for successfull payment.
        });
        res.send(paymentIntent);
        // console.log(paymentIntent.next_action.use_stripe_sdk.stripe_js);


    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            message: "catch error",
            data: error.message
        })

    }

}

exports.tranctionList = async (req, res, next) => {
    try {
        const TransctionList = await stripe.balanceTransactions.list({})
        if (TransctionList) {
            return res.json({
                status: 200,
                result: "success",
                message: "Transction data fetch successfully",
                data: TransctionList
            })
        }

    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            message: "catch error",
            data: error.message
        })
    }
}

exports.payment1 = async function (req, res) {
    try {
        const exCustomer = await CustomerTable.findAll({
            where: { id: req.id }
        })
        const transctionStatus = await order.findOne({
            where: { OrderId: req.body.id }
        })
        if (transctionStatus != 0) {
            return res.json({
                status: 400,
                message: "Amount already paid"
            })
        }
        const Customer = await stripe.customers.create({
            name: exCustomer[0].name,
            email: exCustomer[0].email
        })
        let paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: req.body.number,
                exp_month: req.body.exp_month,
                exp_year: req.body.exp_year,
                cvc: req.body.cvc,
            },
        });
        const orderDetail = await order.findAll({
            where: { id: req.body.id }
        })
        let amount = orderDetail[0].TotalPayableAmount
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method: paymentMethod.id,
            amount: amount * 100, // USD*100
            currency: 'inr',
            confirm: true,
            payment_method_types: ['card'],
            off_session: true,
            customer: Customer.id
        });

        console.log(paymentIntent.id);
        console.log("Received Amount ", paymentIntent.amount_received);

        if (paymentIntent.amount_received) {
            const PaymentDetailId = await paymentDetail.create({
                transctionStatus: true,
                transctionId: paymentIntent.id
            })
            await order.update({ transctionId: PaymentDetailId, transctionStatus: 1 }, {
                where:
                    { id: req.body.id }
            })
            //deleting from userCart
            // await addToCart.destroy({
            //     where: { UserId: req.UserId }
            //   })
            return res.send({
                message: "order Placed successfully ",
                details: paymentIntent
            });
        } else {
            return res.json({
                message: "Payment Failed"
            })
        }
    }
    catch (err) {
        // next(err)
        return res.json({
            message: err.message
        })
    }
}