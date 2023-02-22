const sequelize = require("sequelize");
const customer = require("../Models/customer");
const OTP = require("../Models/otp");
const address = require("../Models/address")



const createCustomer = (dataToSet) =>
    new Promise((reslove, reject) => {
        customer.create(dataToSet)
            .then(client => reslove(client))
            .catch(err => reject(err));
    });

const checkCustomer = (criteria) =>
    new Promise((reslove, reject) => {
        customer.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    })
const updateCustomer = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        customer.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });
const addAddress=(dataToSet)=>
new Promise((reslove,reject)=>{
    address.create(dataToSet)
    .then(client=>reslove(client))
    .catch(err=>reject(err));
})
// ................................

const checkEmail = (criteria) =>
    new Promise((reslove, reject) => {
        OTP.findOne({ where: criteria, raw: true })
            .then(client => reslove(client))
            .catch(err => reject(err));
    })
const createOtp = (dataToSet) =>
    new Promise((reslove, reject) => {
        OTP.create(dataToSet)
            .then(client => reslove(client))
            .catch(err => reject(err));
    });
const updateOtp = (criteria, dataToSet) =>
    new Promise((resolve, reject) => {
        OTP.update(dataToSet, { where: criteria })
            .then(client => resolve(client))
            .catch(err => reject(err));
    });

module.exports = {
    createCustomer: createCustomer,
    checkEmail: checkEmail,
    checkCustomer: checkCustomer,
    updateCustomer: updateCustomer,
    addAddress:addAddress,
    createOtp: createOtp,
    updateOtp: updateOtp
}