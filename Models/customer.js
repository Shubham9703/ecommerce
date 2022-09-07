const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize,DataTypes)=>{
const customer = sequelize.define("customer", {
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
    email: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    mobile: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    gender: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    address: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    step: {
        type: Sequelize.STRING,
        defaultValue:0,
        allowNull: true,
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue:1,
    },
});
module.exports=customer
}


