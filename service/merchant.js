const sequelize = require("sequelize");
const customer = require("../Models/customer");
const address = require("../Models/address");
const merchant = require("../Models/merchant");
const product = require("../Models/product");
const category = require("../Models/category");
const subCategory = require("../Models/subcategory");
const order = require("../Models/order");
const cart = require("../Models/cart");
const orderTable=require("../Models/orderTable");
const paymentDeail = require("../Models/paymentDetail");


// Associatons.........
customer.hasMany(address, { foreignKey: 'CustomerId' })
address.belongsTo(customer, { foreignKey: 'CustomerId' })

merchant.hasMany(product, { foreignKey: "MerchantId" });
product.belongsTo(merchant, { foreignKey: "MerchantId" });

category.hasMany(subCategory, { foreignKey: "CategoryId" })
subCategory.belongsTo(category, { foreignKey: "CategoryId" })

category.hasMany(product, { foreignKey: "CategoryId" })
product.belongsTo(category, { foreignKey: "CategoryId" })


merchant.hasMany(order, { foreignKey: "MerchantId" });
order.belongsTo(merchant, { foreignKey: "MerchantId" });

customer.hasMany(order, { foreignKey: "CustomerId" });
order.belongsTo(customer, { foreignKey: "CustomerId" });

product.hasMany(order, { foreignKey: "ProductId" })
order.belongsTo(product, { foreignKey: "ProductId" })

customer.hasMany(cart, { foreignKey: "CustomerId" });
cart.belongsTo(customer, { foreignKey: "CustomerId" });

product.hasMany(cart, { foreignKey: "ProductId" })
cart.belongsTo(product, { foreignKey: "ProductId" })

merchant.hasMany(cart, { foreignKey: "MerchantId" });
cart.belongsTo(merchant, { foreignKey: "MerchantId" });

customer.hasMany(orderTable,{foreignKey:"CustomerId"})
orderTable.belongsTo(customer,{foreignKey:"CustomerId"})

product.hasMany(orderTable,{foreignKey:"ProductId"})
orderTable.belongsTo(product,{foreignKey:"ProductId"})

merchant.hasMany(orderTable,{foreignKey:"MerchantId"})
orderTable.belongsTo(merchant,{foreignKey:"MerchantId"})

// paymentDeail.hasOne(order),{foreignKey:"TransctionId"}
// order.belongsTo(paymentDeail),{foreignKey:"TransctionId"}

// ....................................................................

const productList = (criteria) =>
    new Promise((reslove, reject) => {
        product.findAndCountAll({
            include: merchant,
            where: criteria, raw: true
        })
            .then(client => reslove(client))
            .catch(err => reject(err));
    })

const createMerchant = (dataToSet) =>
    new Promise((reslove, reject) => {
        merchant.create(dataToSet)
            .then(client => reslove(client))
            .catch(err => reject(err));
    });

const checkMerchant = (criteria) =>
    new Promise((reslove, reject) => {
        merchant.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    })

const setPassword = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        merchant.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });

const checkProduct = (criteria) =>
    new Promise((reslove, reject) => {
        product.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    });

const addProduct = (dataToSet) =>
    new Promise((reslove, reject) => {
        product.create(dataToSet)
            .then(client => reslove(client))
            .catch(err => reject(err));
    });

const checkCategory = (criteria) =>
    new Promise((reslove, reject) => {
        category.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    });
const addCategory = (dataToSet) =>
    new Promise((reslove, reject) => {
        category.create(dataToSet)
            .then(client => reslove(client))
            .catch(err => reject(err));
    })

const checkSubcategory = (criteria) =>
    new Promise((reslove, reject) => {
        subCategory.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    });
const addSubcategory = (dataToSet) =>
    new Promise((reslove, reject) => {
        subCategory.create(dataToSet)
            .then(client => reslove(client))
            .catch(err => reject(err));
    })

    const SellProductList = (criteria) =>
    new Promise((reslove, reject) => {
        order.findAndCountAll({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    });

module.exports = {
    createMerchant: createMerchant,
    setPassword: setPassword,
    checkMerchant: checkMerchant,
    checkProduct: checkProduct,
    addProduct: addProduct,
    productList: productList,
    checkCategory: checkCategory,
    addCategory: addCategory,
    checkSubcategory: checkSubcategory,
    addSubcategory: addSubcategory,
    SellProductList:SellProductList
}