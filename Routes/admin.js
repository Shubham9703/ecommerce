const express=require("express");
const router=express.Router();
const adminController=require("../Controllers/admin");
const auth=require("../middleware/auth");

// // Swagger
// const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');
// // const app = require("../server");
// // const app = require("../server");


// const swaggerOptions={
//     swaggerDefinition:{
//         info:{
//             title:"Test of swagger",
//             version:"1.0.0"
//         }
//     },
//     apis:['server.js']
// };
// const swaggerDocs=swaggerJsdoc(swaggerOptions);
// app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocs))

// /**
//  * @swagger
//  * /customerList
//  * get:
//  *      Description:Get all customer
//  * responces:
//  * 200
//  */



router.post("/adminLogin",adminController.adminLogin);
router.get("/merchantList",auth.authorization,adminController.merchantList);
router.post("/merchantVerify",auth.authorization,adminController.merchantVerify);
router.get("/customerList",auth.authorization,adminController.customerList);
router.post("/customerStatus",auth.authorization,adminController.customerStatus);
router.post("/merchantStatus",auth.authorization,adminController.merchantStatus);
router.post("/productStatus",auth.authorization,adminController.productStatus);



module.exports=router;