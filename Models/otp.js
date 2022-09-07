const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
    const otp = sequelize.define("otp", {

        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        email: {
            type: Sequelize.STRING,
           
        },
        otp: {
            type: Sequelize.STRING,
        },
        otpTime: {
            type: Sequelize.STRING,
        },
        otpVerify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue:1,
        },
    });
    module.exports = otp;
}