const customer = require("../Models/customer");
const Address = require("../Models/address")
const order = require("../Models/order")
const product = require("../Models/product");
const OTP = require("../Models/otp");
const cart = require("../Models/cart");
const orderTable = require("../Models/orderTable")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const commonFunction = require("../helper/commonFunction");
const status = require('http-status');

// Service
const customerService = require("../service/customer");



// *********************CUSTOMER MANAGEMENT************************************

exports.otpSend = async function (req, res, next) {
    try {
        const { email } = req.body;
        let criteria = {
            email: email
        }
        let exUser = await customerService.checkEmail(criteria);
        if (exUser) {
            let otp = commonFunction.getOtp();
            let otpTime = new Date().getTime();
            let subject = "verify your otp";
            let text = `Dear User Please verify your otp using this: ${otp}\n`
            let dataToSet = {
                email: email,
                otp: otp,
                otpTime: otpTime,
            }
            //send email
            commonFunction.sendMail(email, subject, text, (sendMailError, sendMailResult) => {
                console.log(sendMailResult);
                if (sendMailError) {
                    return res.json({
                        // status: 500,
                        status:status.INTERNAL_SERVER_ERROR,
                        result: "error",
                        message: "Internal server error"
                    });
                }
            });
            const customer_otp = customerService.updateOtp(criteria, dataToSet);
            const theToken = jwt.sign({ email: req.body.email }, 'the-super-strong-secrect', { expiresIn: '2h' });
            return res.json({
                status:status.OK,
                // status: 200,
                result: "success",
                message: "Otp updated successfully",
                token: theToken,
                data: dataToSet
            })
        } else {
            let otp = commonFunction.getOtp();
            let otpTime = new Date().getTime();
            let subject = "verify your otp";
            let text = `Dear User Please verify your otp using this: ${otp}\n`
            let dataToSet = {
                email: email,
                otp: otp,
                otpTime: otpTime,
            }
            //send email
            commonFunction.sendMail(email, subject, text, (sendMailError, sendMailResult) => {
                console.log(sendMailResult);
                if (sendMailError) {
                    return res.json({
                        // status: 500,
                        status:status.INTERNAL_SERVER_ERROR,
                        result: "error",
                        message: "Internal server error"
                    });
                }
            });
            const customer_otp = await customerService.createOtp(dataToSet);
            if (customer_otp) {
                const theToken = jwt.sign({ email: req.body.email }, 'the-super-strong-secrect', { expiresIn: '2h' });
                return res.json({
                    // status: 200,
                    status:status.OK,
                    result: "success",
                    token: theToken,
                    message: "Otp send successfully!",
                    data: dataToSet
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status: 500,
            status:status.BAD_REQUEST,
            result: "error",
            message:"catch error"
        });
    }
}

exports.verifyOtp = async function (req, res) {
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
                req.email = decoded.email;
                console.log(req.email);
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                // status:status.
                message: 'Please provide token'
            });
        }
        const { email, otp } = req.body;
        let criteria = {
            email: req.email,
        }
        if (req.body.email == criteria.email) {
            let result = await customerService.checkEmail(criteria);
            if (result) {
                let dataToSet = {
                    otpVerify: 1,
                    otp: 0,
                    status: 1
                }
                if (result.otpVerify != 1) {
                    let otpTimeDifference = (new Date().getTime()) - result.otpTime;
                    if (otpTimeDifference <= (3 * 60 * 1000)) {
                        if (result.otp == otp) {
                            OTP.update(dataToSet, { where: { email: email } }).then(data => {
                                if (!data) {
                                    return res.json({
                                        // status: 500,
                                        status:status.NOT_FOUND,
                                        result: "error",
                                        message: "Data not found"
                                    });
                                } else {
                                    const theToken = jwt.sign({ email: req.body.email, status: 1 }, 'the-super-strong-secrect', { expiresIn: '2h' });
                                    return res.json({
                                        // status: 200,
                                        status:status.OK,
                                        result: "success",
                                        message: "OTP verify successfully.",
                                        token: theToken,
                                        data: dataToSet
                                    });
                                }
                            });
                        } else {
                            return res.json({
                                // status: 500,
                                status:status.FORBIDDEN,
                                result: "error",
                                message: "OTP not match"
                            })
                        }
                    } else {
                        return res.json({
                            // status: 403,
                            status:status.GATEWAY_TIMEOUT,
                            result: "error",
                            message: "OTP time has been expired: Please resend otp and try again."
                        });
                    }
                } else {
                    const theToken = jwt.sign({ email: req.body.email, status: 1 }, 'the-super-strong-secrect', { expiresIn: '2h' });
                    return res.json({
                        // status: 409,
                        status:status.ALREADY_REPORTED,
                        result: "error",
                        token: theToken,
                        message: "OTP already verified."
                    });
                }
            }
        } else {
            return res.json({
                // status: 400,
                status:status.NOT_ACCEPTABLE,
                result: "error",
                message: "Email Mismatch"
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status: 500,
            status:status.BAD_GATEWAY,
            result: "error",
            message: "catch error"
        });
    }
}

exports.register = async function (req, res) {
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
                req.email = decoded.email;
                req.status=decoded.status;
                console.log(req.email);
                console.log(req.status);
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const { name, email, mobile, password, gender } = req.body;
        if (req.status == 1 && req.email == email) {
            let criteria={
                email:email
            }
            let customerdata = await customerService.checkCustomer(criteria)
            if (customerdata == null) {
                const bcryptpassword = await bcrypt.hash(password + "", 12);
                let dataToSet = {
                    email: email,
                    name: name,
                    mobile: mobile,
                    password: bcryptpassword,
                    status: 1
                }
                let data = await customerService.createCustomer(dataToSet);
                const theToken = jwt.sign({ id: data.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
                res.json({
                    // status: 200,
                    status:status.OK,
                    result: "success",
                    message: "Customer successfully registered!",
                    token: theToken,
                    data: data

                })
            } else {
                res.json({
                    // status: 404,
                    status:status.ALREADY_REPORTED,
                    result: "error",
                    message: "Email already exists!"
                })
            }
        } else {
            res.json({
                // status: 404,
                status:status.NOT_ACCEPTABLE,
                result: "error",
                message: "Email mismatch!"
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status: 500,
            status:status.BAD_GATEWAY,
            result: "error",
            message: " catch error"

        })
    }

}

//Login...................
exports.login = async (req, res, next) => {
    try {
        const { email, password, } = req.body;
        if (!email || !password) {
            return res.json({
                status: 400,
                result: "error",
                message: "Please provide valid input details."
            });
        }
        let criteria = {
            [Op.or]: [
                { mobile: email }, { email: email }
            ]
        }
        let Customer = await customerService.checkCustomer(criteria);
        if (Customer) {
            const customerJsn = JSON.parse(JSON.stringify(Customer));
            const isEqual = await bcrypt.compare(password, customerJsn.password);
            if (isEqual) {
                delete customerJsn.password;
                const theToken = jwt.sign({ id: Customer.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
                return res.json({
                    // status: 200,
                    status:status.OK,
                    result: "success",
                    message: "Login successfully",
                    token: theToken,
                    data: customerJsn
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
                status: 400,
                result: "error",
                message: "Please enter valid credentials"
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "catch error"
        })
    }

}

//Address......................
exports.addAddress = async function (req, res, next) {
    try {
        const { address, city, country, zip_code } = req.body;
        // let token = req.headers.authorization;
        // if (token) {
        //     token = token.split(" ")[1];
        //     jwt.verify(token, 'the-super-strong-secrect', (err, decoded) => {
        //         if (err) {
        //             return res.json({
        //                 status: 404,
        //                 message: `Invalid token or unauthorised access`
        //             })
        //         }
        //         req.id = decoded.id;
        //         console.log(req.id);
        //     })
        // } else {
        //     console.log(token);
        //     res.json({
        //         status: 303,
        //         message: 'Please provide token'
        //     });
        // }
        let dataToSet = {
            address: address,
            city: city,
            country: country,
            zip_code: zip_code,
            CustomerId: req.id

        };
        const add_address = await customerService.addAddress(dataToSet);
        return res.json({
            status: 200,
            result: "success",
            message: "address details created successfully",
            data: dataToSet
        })
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message:"Catch error"

        });
    }
}

exports.productList=async(req,res,next)=>{
    try {
        const productList=await product.findAndCountAll({
            where:{status:1}
        })
        if (productList){
            return res.json({
                status:200,
                result:"success",
                message:"product list fetched Successfully",
                data:productList
                
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status:500,
            result:"error",
            message:"catch error"
        })
    }
   
}

exports.search = async (req, res, next) => {
    try {
        const search = req.params.input;
        const list = await product.findAll({
            where: {
                [Op.or]: { pName: { [Op.regexp]: search } },
                // { description: { [Op.regexp]: search } }]
            }
        });
        if (list.length) {
            return res.json({
                status: 200,
                message: "product searched",
                Details: list
            })
        } else {
            return res.json({
                status: 422,
                message: "Not find anything"
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "catch error",

        });
    }
}

exports.addTocart = async (req, res, next) => {
    try {
        const Product = await product.findAll({ where: { id: req.query.ProductId } })
        const quantity = req.body.quantity ?? 1;
        const totalprice = Product[0].price * quantity;
        const check = Product[0].pQuantity - quantity;
        if (check < 0) {
            return res.json({
                status: 404,
                message: " Product haven't enough quantity"
            });
        }
        const exproduct = await cart.findOne({ where: { ProductId: req.query.ProductId } })
        if (exproduct) {
            return res.json({
                status:status.FOUND,
                result:"success",
                message:"Product already exist in card"
            })
            // await cart.update(
            //     { quantity: req.body.quantity, totalPrice: Product[0].price * quantity },
            //     { where: { ProductId: req.query.ProductId } }
            // )
            // return res.json({
            //     message: "product quantity updated successfully"
            // });
        }
        await cart.create({
            name: Product[0].pName,
            price: Product[0].price,
            discountPercent:Product[0].discountPercent,
            originalPrice:Product[0].originalPrice,
            quantity: req.body.quantity,
            MerchantId: Product[0].MerchantId,
            ProductId: Product[0].id,
            totalPrice: totalprice,
            CustomerId: req.id
        });
        console.log(check);
        // product.update({ pQuantity: check }, { where: { id: Product[0].id } })
        return res.json({
            status: 200,
            result:"success",
            message: "Product added to cart",
            data:cart
        });
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message:"catch error"

        });
    }
};

exports.removeFromcart=async(req,res,next)=>{
    try {
        const removeCart=await cart.destroy({
            where:{id:req.body.ProductId}
        })
        if(removeCart){
            return res.json({
                // status:200,
                status:status.OK,
                result:"success",
                message:"product successfully removed from cart"
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status:500,
            status:status.BAD_REQUEST,
            result:"error",
            message:"catch error"
        })
        
    }
}

exports.cartList = async (req, res, next) => {
    try {
        const cartList = await cart.findAndCountAll({
            where:{CustomerId:req.id}
        })
        if (cartList) {
            return res.json({
                // status: 200,
                status:status.FOUND,
                message: "cart data fetched successfully",
                data: cartList
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status: 500,
            status:status.BAD_REQUEST,
            result: "error",
            message: "catch error"
        })

    }
}

// ..........
exports.orderProduct = async (req, res, next) => {
    try {
        const address = await Address.findAll({
            where: { id: req.body.id },
            attributes: {
                exclude: [ "id","createdAt", "updatedAt", "CustomerId"],
            },
        });
        const orderAddress = address[0].address + ", " + address[0].city + " ," + address[0].country + " ," + address[0].zip_code;
        if (address.length == 0) {
            return res.json({
                status:404,
                result:"Address not found",
                message: "please select or add a new address for order ",
            });
        }
        const ProductsFromCart = await cart.findAll({
            where: { CustomerId: req.id },
            //  attributes: { exclude: ["id", "createdAt", "updatedAt", "status"] }
        })
        if (ProductsFromCart.length == 0) {
            return res.json({
                status:404,
                result:"Not found",
                message: "Cart is empty"
            })
        }
        //........................order.........
        let total = 0;
        for (i = 0; i < ProductsFromCart.length; i++) {
            total = total + ProductsFromCart[i].dataValues.totalPrice;
        }
        let shippingCharge = 0;
        if (total <= 1000) {
            shippingCharge = 100;
            total = total + shippingCharge;
        }
        const customerDetails = await customer.findAll({ where: { id: req.id } })

        const createOrder = await order.create({
            customerName: customerDetails[0].name,
            address: orderAddress,
            CustomerId: req.id,
            TotalPayableAmount: total,
            shippingCharge: shippingCharge,
            MerchantId:ProductsFromCart[0].MerchantId,
            ProductId:ProductsFromCart[0].ProductId
        })
        //inserting in OrderTable
        let length = ProductsFromCart.length
        let arrObj = [], 
        index = 0;
        while (length != 0) {
            arrObj[index] = ProductsFromCart[index].dataValues;
            const getMerchantDetail = await product.findAll({
                where: { id: arrObj[index].ProductId }
            })
            arrObj[index].MerchantId = getMerchantDetail[0].MerchantId
            arrObj[index].OrderId = createOrder.id
            index++;
            length--;
        }
        const orderTableInsertion = await orderTable.bulkCreate(arrObj)
        // ...................................................................................
        //updating Quantity in product table
        for (let i = 0; i < arrObj.length; i++) {
            const ProductDetail = await product.findAll({
                where: { id: arrObj[i].ProductId }
            })
            let quantity = ProductDetail[0].pQuantity - arrObj[i].quantity
            await product.update({ pQuantity: quantity }, {
                where: {
                    id: arrObj[i].ProductId
                }
            })
            console.log(quantity);
        }
        
        // // .................................................................
        // // deleting from Customer Cart
        await cart.destroy({
            where: { CustomerId: req.id }
        })
        return res.json({
            status: 200,
            result:"success",
            message: "Order succssfully created",
            data: createOrder
        })
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "catch error",

        });
    }
}

exports.orderList = async (req, res, next) => {
    try {
        console.log(req.id);
        const orderList = await order.findAll({
            where:{CustomerId:req.id}
        })
        if (orderList) {
            return res.json({
                // status: 200,
                status:status.FOUND,
                message: "Order list fetched successfully",
                data: orderList
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status: 500,
            status:status.INTERNAL_SERVER_ERROR,
            result: "error",
            message: "catch error"
        })

    }
}

exports.orderTableList = async (req, res, next) => {
    try {
        console.log(req.id);
        const OrderTable = await orderTable.findAll({
            // where:{CustomerId:req.id}
        })
        if (OrderTable) {
            return res.json({
                // status: 200,
                status:status.FOUND,
                message: "Order table list fetched successfully",
                data: OrderTable
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            // status: 500,
            status:status.INTERNAL_SERVER_ERROR,
            result: "error",
            message: "catch error"
        })

    }
}

