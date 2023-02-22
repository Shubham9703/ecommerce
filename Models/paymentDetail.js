const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
    const paymentDetail = sequelize.define("paymentDetail", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        transctionStatus: {
            type: Sequelize.INTEGER,
            // defaultValue: 0
        },
        TransctionId:{
            type:Sequelize.STRING
        },
        // orderId:{
        //     type:Sequelize.INTEGER
        // }
    });
    module.exports = paymentDetail;
}

