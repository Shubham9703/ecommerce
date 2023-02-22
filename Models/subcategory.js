const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/database");
module.exports = (sequelize, DataTypes) => {
    const subcategory = sequelize.define("subcategory", {

        id: {
            // type: Sequelize.UUID,
            // defaultValue:Sequelize.UUIDV4,
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        Subcategory: {
            type: Sequelize.STRING,
        },
    });
    module.exports = subcategory;
}