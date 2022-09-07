const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
const cart = sequelize.define("cart", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    originalPrice:{
        type:Sequelize.DECIMAL(10,2)
    },
    discountPercent:{
    type:Sequelize.DECIMAL(10,2)
    }
});
module.exports=cart;
}
    