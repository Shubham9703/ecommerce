
const express= require('express');
const app=express();
app.use(express.json());
const mysql= require("mysql")
const bodyparser= require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
const port=5151;
const sequelize= require("./database/database"); // Database  

const customersRouter= require("./Routes/customer"); //  Customer Router
app.use("/customers",customersRouter);

const merchantRouter= require("./Routes/merchant"); // Merchant Router
app.use("/merchant",merchantRouter);

const adminRouter= require("./Routes/admin"); //  Admin Router
app.use("/admin",adminRouter);

const stripe=require("./Routes/payment")      // Payment Router
app.use("/stripe",stripe);

app.get('/',(req,res)=>{
res.send('Testing')
})



app.listen(port,()=>{
    console.log(`server is running on port http://localhost:${port}`);
})
module.exports=sequelize;
module.exports = app;


