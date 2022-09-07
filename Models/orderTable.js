const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
const orderTable = sequelize.define("orderTable", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    quantity: {
        type: Sequelize.STRING,
        defaultValue: "",
        allowNull: true,
    },
    customerName: {
        type: Sequelize.STRING,
    },
    price: {
        type: Sequelize.STRING,
    },
    totalPrice: {
        type: Sequelize.STRING,
    },

});

module.exports=orderTable;
}
