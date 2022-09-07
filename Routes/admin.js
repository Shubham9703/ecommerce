const express=require("express");
const router=express.Router();
const adminController=require("../Controllers/admin");
const auth=require("../middleware/auth");

router.post("/adminLogin",adminController.adminLogin);
router.get("/merchantList",auth.authorization,adminController.merchantList);
router.post("/merchantVerify",auth.authorization,adminController.merchantVerify);
router.get("/customerList",auth.authorization,adminController.customerList);
router.post("/customerStatus",auth.authorization,adminController.customerStatus);
router.post("/merchantStatus",auth.authorization,adminController.merchantStatus);
router.post("/productStatus",auth.authorization,adminController.productStatus);



module.exports=router;