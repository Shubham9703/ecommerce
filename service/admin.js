const sequelize = require("sequelize");
const merchant = require("../Models/merchant");
const customer=require("../Models/customer");
const admin = require("../Models/admin");
const product = require("../Models/product");


const checkAdmin = (criteria) =>
new Promise((reslove, reject) => {
    admin.findOne({ where: criteria, raw: true })
        .then(client => reslove(client))
        .catch(err => reject(err));
})
    const merchantList = (criteria, offset, limit) =>
    new Promise((resolve, reject) => {
        merchant.findAndCountAll({ where: criteria, raw: true, 'offset': parseInt(offset), 'limit': parseInt(limit) })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });
    const checkMerchant = (criteria) =>
    new Promise((reslove, reject) => {
        merchant.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    })

    const updateMerchant = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        merchant.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });

    const customerList = (criteria, offset, limit) =>
    new Promise((resolve, reject) => {
        customer.findAndCountAll({ where: criteria, raw: true, 'offset': parseInt(offset), 'limit': parseInt(limit) })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });

    const customerStatus = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        customer.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });

    const merchantStatus = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        merchant.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });

    const productStatus = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        product.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });
    module.exports={
        merchantList:merchantList,
        checkMerchant:checkMerchant,
        updateMerchant:updateMerchant,
        customerList:customerList,
        checkAdmin:checkAdmin,
        customerStatus:customerStatus,
        merchantStatus:merchantStatus,
        productStatus:productStatus
    }