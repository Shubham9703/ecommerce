
const express = require('express');
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mysql = require("mysql")
const bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
const port = 5151;
const sequelize = require("./database/database"); // Database 









const customersRouter = require("./Routes/customer"); //  Customer Router
app.use("/customers", customersRouter);

const merchantRouter = require("./Routes/merchant"); // Merchant Router
app.use("/merchant", merchantRouter);

const adminRouter = require("./Routes/admin"); //  Admin Router
app.use("/admin", adminRouter);

// Payment......................
const stripe = require("./Routes/payment")      // Stripe Router........
app.use("/stripe", stripe);

const paypal = require("./Routes/payment")      // Paypal Router....
app.use("/paypal", paypal);

const razorpay = require("./Routes/payment")   //Razorpay Route....
app.use("/", razorpay);



app.get('/', (req, res) => {
    res.send('Testing')
})
app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
})
module.exports = sequelize;
module.exports = app;


