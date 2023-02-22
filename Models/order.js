const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
    const order = sequelize.define("order", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        address: {
            type: Sequelize.STRING,
        },
        customerName: {
            type: Sequelize.STRING,
        },
        TotalPayableAmount: {
            type: Sequelize.INTEGER,
        },
        shippingCharge: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        // transctionStatus:{
        //     type:Sequelize.STRING,
        //     defaultValue: 0
        // },
        // transctionId:{
        //     type:Sequelize.STRING
        // }
    });
    module.exports = order;
}


