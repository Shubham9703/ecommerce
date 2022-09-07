const express=require("express");
const router=express.Router();
const customerController=require("../Controllers/customer");
const auth=require("../middleware/auth");
const validation=require("../middleware/validation");



router.post("/otpSend",customerController.otpSend);
router.post("/verifyOtp",auth.authorization,customerController.verifyOtp);
router.post("/register",auth.authorization,customerController.register);
router.post("/login",customerController.login);
router.post("/addAddress",auth.authorization,customerController.addAddress);
router.post("/search/:input",customerController.search);
router.get("/productList",customerController.productList);
router.post("/addTocart",auth.authorization,customerController.addTocart);
router.post("/removeFromcart",customerController.removeFromcart);
router.get("/cartList",auth.authorization,customerController.cartList);
router.post("/orderProduct",auth.authorization,customerController.orderProduct)
router.get("/orderList",auth.authorization,customerController.orderList);
router.get("/orderTableList",auth.authorization,customerController.orderTableList);
//.....................




module.exports=router;