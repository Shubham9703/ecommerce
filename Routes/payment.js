const express=require("express");
const router=express.Router();
const stripe=require("../Controllers/stripePayment");


router.post("/createCustomer",stripe.createCustomer);
router.post("/payment",stripe.payment);
router.get("/customerList",stripe.customerList);
router.get("/tranctionList",stripe.tranctionList);



module.exports=router