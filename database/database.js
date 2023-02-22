const {Sequelize,DataTypes} = require("sequelize");
const sequelize = new Sequelize(
    'ecommerse',//Database name
    'debian-sys-maint',//user
    'Shubham@1998',//password 
    {
        host: 'localhost',
        dialect: 'mysql',
        // logging: false
    }

);
sequelize.authenticate()
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.log("error" + err);
    })


// ...............

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize
db.customer = require('../Models/customer')(sequelize)
db.merchant = require('../Models/merchant')(sequelize)
admin=require("../Models/admin")(sequelize);
db.address=require("../Models/address")(sequelize)
db.otp=require('../Models/otp')(sequelize)
db.category=require("../Models/category")(sequelize)
db.subcategory=require("../Models/subcategory")(sequelize);
db.product = require('../Models/product')(sequelize)
db.order=require("../Models/order")(sequelize)
db.cart=require("../Models/cart")(sequelize)
db.orderTable=require("../Models/orderTable")(sequelize)
db.paymentDetail=require("../Models/paymentDetail");

// db.sequelize.sync({alter:true })
db.sequelize.sync({force:false})
.then(() => {
    console.log('yes re-sync done!')
})
module.exports = db



module.exports =sequelize;



