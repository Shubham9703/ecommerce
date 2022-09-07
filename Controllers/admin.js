const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const commonFunction = require("../helper/commonFunction");
const status = require('http-status');

// Servie................
const adminService = require("../service/admin");



//Login...................
exports.adminLogin = async (req, res, next) => {
    const { email, password, } = req.body;
    if (!email || !password) {
        return res.json({
            // status: 400,
            status:status.BAD_REQUEST,
            result: "error",
            message: "Please provide valid input details."
        });
    }
    let criteria = {
        [Op.or]: [
            { mobile: email }, { email: email }
        ]
    }
    let admin = await adminService.checkAdmin(criteria);
    if (admin) {
        const adminJsn = JSON.parse(JSON.stringify(admin));
        const isEqual = await bcrypt.compare(password, adminJsn.password);
        if (isEqual) {
            delete adminJsn.password;
            const theToken = jwt.sign({ id: admin.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
            return res.json({
                // status: 200,
                status:status.OK,
                result: "success",
                message: "Admin login successfully",
                token: theToken,
                data: adminJsn
            });
        } else {
            return res.json({
                // status: 400,
                status:status.NOT_ACCEPTABLE,
                result: "error",
                message: "Invalid credentials"
            });
        }
    } else {
        return res.json({
            // status: 400,
            status:status.UNAUTHORIZED,
            result: "error",
            message: "Please enter valid credentials"
        });
    }
}

//All Merchant List.......................
exports.merchantList = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, 'the-super-strong-secrect', (err, decoded) => {
                if (err) {
                    return res.json({
                        // status: 404,
                        status:status.UNAUTHORIZED,
                        message: `Invalid token or unauthorised access`
                    })
                }
                req.id = decoded.id;
                console.log(req.id);
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const { offset, limit } = req.query;
        let criteria = {
        }
        // let offsetVal = offset ? offset : 0;
        let offsetVal = (offset - 1) * limit ? offset : 0
        let limitVal = limit ? limit : 10;
        let merchant = await adminService.merchantList(criteria, offsetVal, limitVal);
        if (merchant) {
            return res.json({
                status: 200,
                result: "success",
                message: "Merchant data fetched successfully!",
                data: merchant
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            status: 500,
            result: "error",
            message: "catch error",
        });
    }
}

// Verify Merchant
exports.merchantVerify = async (req, res) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, 'the-super-strong-secrect', (err, decoded) => {
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                req.id = decoded.id;
                console.log(req.id);
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const { email, id } = req.body;
        let criteria = {
            id: id
        }
        let merchant = await adminService.checkMerchant(criteria);
        if (merchant.emailVerify != 1) {
            let dataToSet = {
                emailVerify: 1,
                status: 1
            };
            const theToken = jwt.sign({ id: merchant.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
            let subject = "your id is Verified please set your password using this token";
            const update_merchant = adminService.updateMerchant(criteria, dataToSet);
            // Send Mail
            commonFunction.sendMail(email, theToken, subject, (sendMailError, sendMailResult) => {
                console.log(sendMailResult);
                if (sendMailError) {
                    return res.json({
                        status: 500,
                        result: "error",
                        message: "Internal server error"
                    });
                }
            });
            if (update_merchant) {
                return res.json({
                    status: 200,
                    result: "success",
                    message: "Merchant verified successfully",
                    data: dataToSet,
                    // data:sendMailResult
                })
            }
        } else {
            return res.send({
                status: 409,
                result: "error",
                message: "Merchant is already verified"
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "catch error"
        });
    }
}

// Customer List
exports.customerList = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, 'the-super-strong-secrect', (err, decoded) => {
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                req.id = decoded.id;
                console.log(req.id);
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const { offset, limit } = req.query;
        let criteria = {
        }
        // let offsetVal = offset ? offset : 0;
        let offsetVal = (offset - 1) * limit ? offset : 0
        let limitVal = limit ? limit : 10;
        let customer = await adminService.customerList(criteria, offsetVal, limitVal);
        if (customer) {
            return res.json({
                status: 200,
                result: "success",
                message: "Customer data fetched successfully!",
                data: customer
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            status: 500,
            result: "error",
            message: "catch error",
        });
    }
}

// Block Customer
exports.customerStatus = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        let criteria = {
            id: id
        }
        let dataToSet = {
            status: status
        };
        if (status == "0") {
            const Customer = adminService.customerStatus(criteria, dataToSet)
            return res.json({
                status: 200,
                result: "success",
                message: "Customer blocked successfully",
                data: dataToSet
            })
        } else if (status == "1") {
            const Customer = adminService.customerStatus(criteria, dataToSet)
            return res.json({
                status: 200,
                result: "success",
                message: "Customer unblocked successfully",
                data: dataToSet
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "catch error"
        });
    }
}

// Block Merchant
exports.merchantStatus = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        let criteria={
            id:id
        }
        let dataToSet = {
            status: status
        };
        if (status == "0") {
            const Merchant = adminService.merchantStatus(criteria,dataToSet)
           
            return res.json({
                status: 200,
                result: "success",
                message: "Merchant blocked successfully",
                data: dataToSet
            })
        } else if (status == "1") {
            const Merchant = adminService.merchantStatus(criteria,dataToSet)
            return res.json({
                status: 200,
                result: "success",
                message: "Merchant unblocked successfully",
                data: dataToSet
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "catch error"
        });
    }
}

// Block Product
exports.productStatus = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        let criteria={
            id:id
        }
        let dataToSet = {
            status: status
        };
        if (status == "0") {
            const Product = adminService.productStatus(criteria,dataToSet)
            return res.json({
                status: 200,
                result: "success",
                message: "Product block successfully",
                data: dataToSet
            })
        } else if (status == 1) {
            const Product =adminService.productStatus(criteria,dataToSet)
            return res.json({
                status: 200,
                result: "success",
                message: "Product unblock successfully",
                data: dataToSet
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "catch error"
        });
    }
}

