const express=require("express");
const router=express.Router();
const merchantController=require("../Controllers/merchant");
const auth=require("../middleware/auth");
const joi=require("../middleware/validation")


router.post("/registerMerchant",merchantController.registerMerchant);
router.post("/setPassword",auth.authorization,merchantController.setPassword);
router.post("/merchantLogin",merchantController.merchantLogin);
router.post("/add",auth.authorization,merchantController.add);     // additional Api
router.post("/addCategory",merchantController.addCategory);
router.post("/addsubCategory",merchantController.addsubCategory);
router.post("/addProduct",auth.authorization,merchantController.addProduct);

router.post("/updateProduct",joi.updateProdctValidation,auth.authorization,merchantController.updateProduct);
router.post("/deleteProduct",auth.authorization,merchantController.deleteProduct);
router.post("/merchantProductList",merchantController.merchantProductList);
router.get("/merchantSoldProductList",auth.authorization,merchantController.merchantSoldProductList);



module.exports=router;