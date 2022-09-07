const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize,DataTypes)=>{
const product = sequelize.define("product", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    pName: {
        type: Sequelize.STRING,
    },
    pQuantity: {
        type: Sequelize.INTEGER,
    },
    price: {
        type: Sequelize.INTEGER,
    },
    SubCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue:1,
        allowNull: true
    },
    originalPrice:{
        type:Sequelize.DECIMAL(10,2)
    },
    discountPercent:{
    type:Sequelize.DECIMAL(10,2)
    },
    hsnCode:{
        type:Sequelize.INTEGER
    },
    description:{
        type:Sequelize.STRING
    }

});
// return product;
module.exports=product
}
// module.exports=product
