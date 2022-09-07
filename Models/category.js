const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
    const category = sequelize.define("category", {

        id: {
            // type: Sequelize.UUID,
            // defaultValue:Sequelize.UUIDV4,
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        category: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    });
    module.exports = category;
}
