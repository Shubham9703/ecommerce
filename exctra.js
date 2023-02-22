// Deepak.....
async function addcustomers(req, res) {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
        jwt.verify(token, 'secret_key', async (err, decoded) => {
            if (err) {
                console.log('Invalid Token');
            }
            else {
                let customerdata = await customers.findOne({
                    where: {
                        email: decoded.email
                    }
                });
                if (customerdata == null) {
                    if (decoded.status == 'verified' && decoded.email == req.body.email) {
                        const salt = await bcrypt.genSalt(10);
                        req.body.password = await bcrypt.hash(req.body.password, salt);
                        let data = await customers.create({
                            email: req.body.email,
                            name: req.body.name,
                            phone: req.body.phone,
                            password: req.body.password
                        });
                        // console.log(data.id);
                        res.json({
                            message: `Customer has been added`
                        })
                    } else {
                        res.json({
                            error: `Email mismatched`
                        })
                    }
                } else {
                    console.log(`Customer details with ${decoded.email} already been added in the database`);
                    res.json({
                        message: `Customer details with ${decoded.email} email already been added`
                    })
                }
            }
        })
    } else {
        console.log(`please provide token`)
    }
}
async function verifyotp(req, res) {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
        jwt.verify(token, "secret_key", async (err, decoded) => {
            if (err) {
                return res.json({
                    message: `OTP Expired`,         // yaha pe kaise otps table se expired row ko delete krenge
                    error: err
                })
            }
            else {
                let data = await otps.findOne({
                    where: {
                        email: decoded.email
                    }
                });
                if (req.body.otp == data.otp) {
                    // let data = await customers.create({
                    //     email: decoded.email
                    // });
                    // console.log(data.id);
                    const token = jwt.sign({ email: decoded.email, status: "verified" }, "secret_key");
                    res.json({
                        message: 'Email verified successfully',
                        token: token
                    });
                    await otps.destroy({
                        where: {
                            email: decoded.email
                        }
                    });
                }
                else {
                    res.json({
                        message: 'wrong otp'
                    })
                }
            }
        })
    } else {
        res.json({
            status: 303,
            message: 'Please provide token'
        });
    }
}
async function placeorder(req, res) {
    try {
        console.log("placeorder");
        let delieveryaddress = await Customeraddress.findOne({
            where: {
                id: req.body.address_id
            }
        });
        delieveryaddress = delieveryaddress.addressLine + " " + delieveryaddress.pin_code + " " + delieveryaddress.city + " " + delieveryaddress.state
        let customercartdetails = await Cart.findAll({
            attributes: [
                "hsncode", "productname", "rate", "quantity", "amount", "discount", "discountedprice", "subtotal", "merchant_id", "product_id", "customer_id",
            ],
            where: {
                customer_id: req.decoded.id
            }
        });
        if (customercartdetails.length == 0) {
            console.log('No products in the cart, add products to cart to placeorder');
            res.json({
                message: 'No products in the cart, add products to cart to placeorder'
            });
        } else {
            const tax = 10;
            const customercart = {};
            // console.log(customercartdetails);
            customercart.totalquantity = 0;
            customercart.total = 0;
            customercart.totaldiscount = 0;
            customercart.subtotal = 0;
            for (let i = 0; i < customercartdetails.length; i++) {
                customercart.totalquantity += Number(customercartdetails[i].dataValues.quantity);
                customercart.total += Number(customercartdetails[i].dataValues.amount);
                customercart.totaldiscount += Number(customercartdetails[i].dataValues.discountedprice);
                customercart.subtotal += Number(customercartdetails[i].dataValues.subtotal);
            }
            customercart.shippingcharge = (customercart.subtotal >= 1000) ? 0 : 70
            customercart.totaltax = customercart.subtotal * tax / 100;
            customercart.grandtotal = Number(customercart.subtotal) + Number(customercart.totaltax) + Number(customercart.shippingcharge);
            customercart.delieveryaddress = delieveryaddress;
            customercart.customer_id = req.decoded.id;
            // console.log(customercart);
            let order = await Order.create(customercart);
            let arr = [];
            for (let i = 0; i < customercartdetails.length; i++) {
                customercartdetails[i].dataValues.order_id = order.id;
                arr[i] = customercartdetails[i].dataValues;
            }
            await Orderhistory.bulkCreate(arr);
            await Cart.destroy({
                where: { customer_id: req.decoded.id }
            });
            res.json({
                message: 'Order successfully'
            });
        }
    } catch (err) {
        console.log(err);
    }
}
// Chitranshu...
exports.OTP = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        // if (row.length
        const exist = await user.findAll({
            where: {
                e_mail: req.body.e_mail
            }
        })
        if (exist.length != 0) {
            return res.json({
                message: "you are already verfied"
            })
        }
        const theToken = jwt.sign(
            { e_mail: req.body.e_mail, status: "notVerified" },
            "secret_key",
            { expiresIn: "10m" }
        );
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "chitranshu@appventurez.com",
                pass: "vfvncglwqrfjlssq",
            },
        });
        let OTP = () => {
            let numbers = "0123456789";
            let OTP = "";
            for (let i = 0; i < 4; i++) {
                OTP += numbers[Math.floor(Math.random() * 10)];
            }
            return OTP;
        };
        const saveOTP = OTP();
        console.log(saveOTP);
        let mailOptions = {
            from: "chitranshu@appventurez.com",
            to: req.body.e_mail,
            subject: "OTP verification",
            text: "your otp is :" + saveOTP,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: ");
            }
        });
        const e_mail = await otp.findAll({
            where: { e_mail: req.body.e_mail }
        })
        console.log(e_mail[0]);
        //////////////////////////////////////////////////////
        if (e_mail.length > 0) {
            await otp.update({ otp: saveOTP, status: "notVerified" }, {
                where:
                    { e_mail: req.body.e_mail }
            })
        }
        else {
            const rows = await otp.create({ otp: saveOTP, e_mail: req.body.e_mail })
        }
        return res.status(201).json({
            message: "otp send",
            token: theToken
        });
    }
    catch (err) {
        next(err);
    }
}
exports.verifyOTP = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, "secret_key", (err, decoded) => {
                console.log(err);
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                console.log(decoded);
                // console.log("id in token  : ", decoded.id)
                // req.id = decoded.id;
                req.e_mail = decoded.e_mail;
            })
        }
        console.log(req.e_mail);
        const del = await otp.destroy({
            where: {
                status: "verified"
            }
        })
        let row = await otp.findAll({
            where: {
                e_mail: req.e_mail
            }
        })
        if (row.length == 0) {
            return res.json({
                message: "OTP Expired! Please try again"
            })
        } else {
            const OTP = row[0].otp
            console.log(OTP);
            if (OTP == req.body.otp) {
                await otp.update({ status: "verified" }, {
                    where: { e_mail: req.e_mail }
                })
                const theToken = jwt.sign(
                    { e_mail: req.e_mail, status: "verified" },
                    "secret_key",
                    { expiresIn: "10m" }
                );
                return res.status(201).json({
                    message: "verify",
                    token: theToken
                });
            }
            else {
                return res.status(201).json({
                    message: "OTP is not  matched"
                });
            }
        }
    } catch (err) {
        next(err);
    }
}
exports.register = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, "secret_key", (err, decoded) => {
                console.log(err);
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                console.log(decoded);
                // console.log("id in token  : ", decoded.id)
                // req.id = decoded.id;
                req.e_mail = decoded.e_mail;
                req.status = decoded.status;
            })
        }
        console.log(req.e_mail);
        const e_mail = await Users.findAll({
            where: {
                e_mail: [req.body.e_mail]
            }
        });
        if (e_mail.length != 0) {
            return res.status(201).json({
                message: "The details already in use",
            });
        }
        const contact = await Users.findAll({
            where: {
                e_mail: req.body.e_mail
            }
        });
        if (contact.length > 0) {
            return res.status(201).json({
                message: "The details already in use",
            });
        }
        //console.log(req.e_mail,req.status);
        const exist = await otp.findAll({
            where: { [Op.and]: [{ e_mail: [req.body.e_mail] }, { status: [req.status] }] }
        })
        console.log(exist.length);
        if (exist.length > 0 && req.e_mail === req.body.e_mail) {
            const hashPass = await bcrypt.hash(req.body.password, 12);
            const add = await Users.create({ name: req.body.name, e_mail: req.body.e_mail, contact: req.body.contact, password: hashPass });
            if (add.length != 0) {
                console.log("asf");
                return res.json({
                    message: "The user has been successfully inserted.",
                });
            }
        }
        else {
            return res.status(422).json({
                message: "e_mail must be same"
            })
        }
    } catch (err) {
        next(err);
    }
}
exports.addProduct = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, "secret_key", (err, decoded) => {
                console.log(err);
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                console.log(decoded);
                // console.log("id in token  : ", decoded.id)
                // req.id = decoded.id;
                req.id = decoded.id;
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        //console.log(email);
        const catId = await category.findOrCreate({
            where: { category: req.body.category }
        })
        console.log("category id is", catId[0].id);
        const sub = {
            subCategory: req.body.subCategory, categoryId: catId[0].id
        }
        const subID = await subCategory.findOrCreate({
            where: sub
        })
        console.log("subcategory is ", subID[0].id);
        const info = {
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            price: req.body.price,
            stock: req.body.stock,
            categoryId: catId[0].id,
            subCategoryId: subID[0].id,
            merchantId: req.id
        }
        const product1 = await product.findOrCreate({ where: info })
        return res.status(200).json({
            message: "product inserted successfully"
        })
    }
    catch (err) {
        next(err);
    }
}
exports.updateProduct = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, "secret_key", (err, decoded) => {
                console.log(err);
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                console.log(decoded);
                req.id = decoded.id;
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const updatePro = await product.update({
            stock: req.body.stock,
            price: req.body.price
        }, {
            where: {
                [Op.and]: [{ id: req.params.productId }, { merchantId: req.id }]
            }
        })
        console.log(updatePro);
        if (updatePro[0] === 1) {
            return res.status(200).json({
                message: "product updated successfully"
            })
        } else {
            return res.status(400).json({
                message: "merchant is not found for this product"
            })
        }
    }
    catch (err) {
        next(err);
    }
}
exports.deleteProduct = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, "secret_key", (err, decoded) => {
                console.log(err);
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                console.log(decoded);
                req.id = decoded.id;
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const delPro = await product.destroy({
            where: {
                [Op.and]: [{ id: req.params.productId }, { merchantId: req.id }]
            }
        })
        console.log(delPro);
        if (delPro) {
            return res.status(200).json({
                message: "product deleted successfully"
            })
        } else {
            return res.status(400).json({
                message: ""
            })
        }
    }
    catch (err) {
        next(err);
    }
}
exports.orderProduct = async (req, res, next) => {
    try {
        //console.log(req.UserId);
        const address1 = await address.findAll({
            where: { id: req.query.addressId },
            attributes: {
                exclude: ["createdAt", "updatedAt", "id", "UserId"],
            },
        });
        //console.log(Object.values(address1[0]));
        const orderAddress = address1[0].address + ", " + address1[0].city + " ," + address1[0].State + " ," + address1[0].PinCode;
        if (address1.length == 0) {
            return res.json({
                message: "please select or add a new address for order ",
            });
        }
        const ProductsFromCart = await addToCart.findAll({
            where: { UserId: req.UserId }, attributes: { exclude: ["CartId", "createdAt", "updatedAt", "status"] }
        })
        if (ProductsFromCart.length == 0) {
            return res.json({
                message: "Nothing is prsent in Cart"
            })
        }
        //inserting in Order Table
        let total = 0;
        for (i = 0; i < ProductsFromCart.length; i++) {
            total = total + ProductsFromCart[i].dataValues.totalAmount;
        }
        // let totalAmount = cartData[0].totalAmount;
        let shippingCost = 0;
        if (total <= 10000) {
            shippingCost = 100;
            total = total + shippingCost;
        }
        const getUserDetails = await users.findAll({ where: { UserId: req.UserId } })
        const createOrder = await order.create({
            Name: getUserDetails[0].name,
            address: orderAddress,
            UserId: req.UserId,
            totalPayableAmount: total,
            shippingCost: shippingCost,
        })
        //............................................................
        //inserting in OrderItems
        let length = ProductsFromCart.length
        let arrObj = [], index = 0;
        while (length != 0) {
            arrObj[index] = ProductsFromCart[index].dataValues;
            const getMerchantDetail = await product.findAll({
                where: { ProductId: arrObj[index].ProductId }
            })
            arrObj[index].MerchantId = getMerchantDetail[0].MerchantId
            arrObj[index].OrderId = createOrder.OrderId
            index++;
            length--;
        }
        const orderItemInsertion = await orderItem.bulkCreate(arrObj)
        // ...................................................................................
        //updating stocks in product table
        for (let i = 0; i < arrObj.length; i++) {
            const ProductDetail = await product.findAll({
                where: { ProductId: arrObj[i].ProductId }
            })
            let quantity = ProductDetail[0].stock - arrObj[i].quantity
            await product.update({ stock: quantity }, {
                where: {
                    ProductId: arrObj[i].ProductId
                }
            })
        }
        //.................................................................
        //deleting from userCart
        await addToCart.destroy({
            where: { UserId: req.UserId }
        })
        return res.json({
            message: "Order Placed"
        })
    } catch (err) {
        next(err.message);
    }
}

// Chandresh

// search Product
exports.product = async (req, res, next) => {
    if (!req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer') ||
        !req.headers.authorization.split(' ')[1]) {
        return res.status(422).send("Message: Please provide the token.")
    }
    try {
        const theToken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(theToken, 'the-secret-login-code');
        let category, subcategory, product = ''
        req.query.product ? product = { [Op.regexp]: req.query.product } : product = { [Op.not]: null }
        req.query.subcategory ? subcategory = { [Op.regexp]: req.query.subcategory } : subcategory = { [Op.not]: null }
        req.query.category ? category = { [Op.like]: req.query.category } : category = { [Op.not]: null }
        const data = await Product.findAll({
            include: [{
                model: Category,
                as: 'category',
                attributes: ['name'],
                where: { name: category }
            }, {
                model: Subcategory,
                as: 'subcategory',
                attributes: ['name'],
                where: { name: subcategory }
            }, {
                model: Merchant,
                as: 'merchant',
                attributes: ['fullname'],
            }]
            ,
            where: { product_name: product },
            attributes: { exclude: ['subcategory_id', 'Category_ID', 'createdAt', 'updatedAt', 'merchant_id'] }
        })
        res.send(data)
    } catch (err) {
        next(err)
    }
}

const placeOrder = async (req, res, next) => {
    try {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
        const theToken = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(theToken, "the-super-strong-secret");
        const address = await addressTable.findAll({
            where: { id: req.query.addressId },
            attributes: {
                exclude: ["createdAt", "updatedAt", "id", "customer_ID"],
            },
        });
        console.log("++++++++++++++++++++++++++++++++++++++++++");
        console.log(Object.values(address[0]));
        const orderAddress =
            address[0].flatNumber +
            " " +
            address[0].area +
            " " +
            address[0].city +
            " " +
            address[0].pinCode;
        // console.log(orderAddress);
        if (address.length == 0) {
            return res.json({
                message: "please select or add a new address for order ",
            });
        }
        const Product = await productTable.findAll({
            where: { id: req.query.productId },
        });
        const quantity = req.body.quantity ?? 1;
        const totalprice = Product.price * quantity;
        console.log("+++++++++++++++++++++++++++++++++++++++++")
        console.log(Product)
        const check = Product[0].stock - quantity;
        if (check < 0) {
            return res.json({
                message: "dont have enough quantity",
            });
        }
        console.log("+++++++++++++++++++++++++++++++++++++++++++++")
        console.log(Product);
        console.log(Product[0].name);
        await Order.create({
            name: Product[0].name,
            price: Product[0].price,
            quantity: quantity,
            totalprice: totalprice,
            status: 1,
            address: orderAddress,
            merchantID: Product[0].merchantID,
            customerID: decoded.id,
            productID: req.query.productId,
        });
        console.log(check);
        await productTable.update({ stock: check }, { where: { id: Product[0].id } });
        return res.json({
            message: "Order placed",
        });
    } catch (err) {
        next(err);
    }
};


// vikash
// place order
exports.placeOrder = async (req, res, next) => {
    try {
        tokenVarification(req, res);
        const theToken = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(theToken, "the-super-strong-secrect");
        const addressCheck = await addressTable.findAll({ where: { Cus_ID: decoded.id } })
        if (addressCheck.length == 0) {
            return res.json({
                message: "this address does not exist please add this address then plece order "
            });
        }
        const Product = await productTable.findAll({ where: { id: req.query.id } })
        const quantity = req.body.quantity ?? 1;
        const check = Product[0].Stock - quantity;
        if (check < 0) {
            return res.json({
                message: "dont have enough quantity"
            });
        }
        await Order.create({
            Name: Product[0].Name, Price: Product[0].Price, Quantity: req.body.quantity,
            Address: req.query.address, MerchantID: Product[0].MerchantID, CustomerID: decoded.id
        });
        console.log(check);
        productTable.update({ Stock: check }, { where: { id: Product[0].id } })
        return res.json({
            message: "Order placed",
        });
    }
    catch (err) {
        next(err);
    }
};
const placeOrder1 = async (req, res, next) => {
    try {
        const decoded = decodedVar(req);
        console.log("+++++++++++++++++++++++++++++++++");
        const cartItem = await QueryListOfCartItems({
            where: { customerId: decoded.id },
            attributes: {
                exclude: ["id", "cartId", "customerId"],
            },
        });
        /////////////////////////////
        let length = cartItem.length;
        let arrObj = [];
        let index = 0;
        let totalpayableAmount = 0;
        let totalQuantity = 0;
        let shippingCharges = 0;
        while (length != 0) {
            // arrObj[index] = cartItem[index].dataValues;
            totalpayableAmount =
                parseInt(totalpayableAmount) +
                parseInt(
                    cartItem[index].dataValues.price * cartItem[index].dataValues.quantity
                );
            totalQuantity =
                parseInt(totalQuantity) + parseInt(cartItem[index].dataValues.quantity);
            index++;
            length--;
        }
        if (totalpayableAmount < 1000) {
            shippingCharges = 100;
            totalpayableAmount = parseInt(totalpayableAmount) + 100;
        }
        const address = await QueryListOfAddress({
            where: { id: req.body.addressId },
            attributes: {
                exclude: ["createdAt", "updatedAt", "id", "customer_ID"],
            },
        });
        if (address.length == 0) {
            return res.json({
                message: "please select or add a new address for order ",
            });
        }
        const orderAddress =
            address[0].flatNumber +
            " " +
            address[0].area +
            " " +
            address[0].city +
            " " +
            address[0].pinCode;
        // const Product = await QueryGetOneProduct({
        //   where: { id: req.query.productId },
        // });
        const quantity = totalQuantity;
        const totalprice = totalpayableAmount;
        // const check = Product.stock - quantity;
        // if (check < 0) {
        //   return res.json({
        //     message: "dont have enough quantity",
        //   });
        // }
        const info = {
            totalQuantity: quantity,
            totalPayableAmount: totalprice,
            status: 1,
            address: orderAddress,
            customerID: decoded.id,
            shippingCharges: shippingCharges,
        };
        console.log("+++++++++++++++++++++++++++");
        const orderInfo = await QueryInsertDataIntoOrders(info);
        length = cartItem.length;
        index = 0;
        console.log(orderInfo.id);
        console.log(cartItem[0].dataValues);
        while (length != 0) {
            cartItem[index].dataValues.orderId = orderInfo.id;
            arrObj[index] = cartItem[index].dataValues;
            index++;
            length--;
        }
        console.log(arrObj);
        const orderItem = await QueryCreateOrderItem(arrObj);
        // Update stocks in product Table
        // await QueryUpdateProducts({ stock: check }, { where: { id: Product.id } });
        return res.json({
            message: "Order placed",
            orderedItem: orderItem,
        });
    } catch (err) {
        next(err);
    }
};



// Shubham old  Apis.........
// Registraction...............
exports.registerCustomer = async function (req, res, next) {
    try {
        const { name, email, mobile, password, gender } = req.body;
        let criteria = {
            email: email,

        }
        let exCustomer = await customerService.checkCustomer(criteria);
        if (exCustomer) {
            return res.json({
                status: 400,
                result: "error",
                message: "Email already registered!"
            });
        }
        const bcryptPassword = await bcrypt.hash(password + "", 12);
        let dataToSet = {
            name: name,
            email: email,
            mobile: mobile,
            password: bcryptPassword,
            gender: gender
        }
        const customer = await customerService.createCustomer(dataToSet);
        if (customer) {
            customer.password = undefined
            return res.json({
                status: 200,
                result: "success",
                message: "Customer registered successfully!",
                data: customer
            });
        }
    } catch (error) {
        console.log(error)
        return res.json({
            status: 500,
            result: "catch error",
        });
    }
}
// OTP send..........
exports.sendOtp = async function (req, res) {
    try {
        const { email } = req.body;
        let criteria = {
            email: email,
        }
        let result = await customerService.checkCustomer(criteria);
        if (result) {
            let otp = commonFunction.getOtp();
            let otpTime = new Date().getTime();
            let subject = "verify your otp";
            let text = `Dear User Please verify your otp using this: ${otp}\n`
            let dataToSet = {
                otp: otp,
                otpTime: otpTime,
                // otpVerify:0
            }
            customer.update(dataToSet, { where: { email: email } }).then(data => {
                // user.update(dataToSet, { where: { id: req.decoded } }).then(data => {
                if (!data) {
                    return res.send({
                        status: 500,
                        result: "error",
                        message: "Internal server error"
                    });
                } else {
                    //send email
                    commonFunction.sendMail(email, subject, text, (sendMailError, sendMailResult) => {
                        console.log(sendMailResult);
                        if (sendMailError) {
                            return res.json({
                                status: 500,
                                result: "error",
                                message: "Internal server error"
                            });
                        }
                    });
                    return res.send({
                        status: 200,
                        result: "success",
                        message: "OTP send successfully",
                        data: dataToSet
                    });
                }
            });
        } else {
            return res.send({
                status: 400,
                result: "error",
                // message: "This email is not registered with us"
                message: "Please Complete the All previous steps "
            });
        }
    } catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            result: "error",
            message: "catch  error"
        });
    }
}
// OTP VERIFY
exports.otpVerify = async function (req, res) {
    try {
        const { email, otp } = req.body;
        let criteria = {
            email: email,
            // id: req.decoded,
        }
        let result = await customerService.checkCustomer(criteria);
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
                        customer.update(dataToSet, { where: { email: email } }).then(data => {
                            // user.update(dataToSet, { where: { id: req.decoded } }).then(data => {
                            if (!data) {
                                return res.json({
                                    status: 500,
                                    result: "error",
                                    message: "Data not found"
                                });
                            } else {
                                return res.json({
                                    status: 200,
                                    result: "success",
                                    message: "OTP verify successfully.",
                                    data: dataToSet
                                });
                            }
                        });
                    } else {
                        return res.json({
                            ststus: 500,
                            result: "error",
                            message: "OTP not match"
                        })
                    }
                } else {
                    return res.json({
                        status: 403,
                        result: "error",
                        message: "OTP time has been expired: Please resend otp and try again."
                    });
                }
            } else {
                return res.json({
                    status: 409,
                    result: "error",
                    message: "OTP already verified."
                });
            }
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
// Akash
exports.orderProduct = async (req, res, next) => {
    try {
        const isUser = req.decoded.UserId;
        if (!isUser) {
            return res.status(422).json({
                message: "You are not an user"
            })
        }
        const addressData = await myDb.address.findAll({
            where: {
                id: req.params.id
            }
        })
        const addressData1 = (addressData[0].address + " , "
            + addressData[0].city + " , "
            + addressData[0].pincode + " , ");
        const userData = await myDb.users.findAll({
            where: {
                UserId: req.decoded.UserId
            }
        })
        const cartData = await myDb.addToCart.findAll({
            where: {
                UserId: req.decoded.UserId
            }
        })
        if (cartData.length == 0) {
            return res.json({
                message: "Nothing is present in Cart"
            })
        }
        let total = 0;
        for (i = 0; i < cartData.length; i++) {
            total = total + cartData[i].dataValues.totalAmount;
        }
        // let totalAmount = cartData[0].totalAmount;
        let shippingCharge = 0;
        if (total <= 1000) {
            total = (total + 100);
            shippingCharge = 100;
        }
        const cartToOrders = await myDb.order.create({
            address: addressData1,
            UserId: req.decoded.UserId,
            userName: userData[0].name,
            TotalPayableAmount: total,
            shippingCharge: shippingCharge
        })
        // return res.json({
        //       message: "order placed",
        //       details: cartToOrders
        // })
        let length = cartData.length;
        let arrObj = [];
        let index = 0;
        while (length != 0) {
            arrObj[index] = cartData[index].dataValues;
            const merchantData = await myDb.product.findAll({
                where: {
                    ProductId: arrObj[index].ProductId
                }
            })
            arrObj[index].MerchantId = merchantData[0].MerchantId
            arrObj[index].OrderId = cartToOrders.OrderId
            index++;
            length--;
        }
        await myDb.orderItem.bulkCreate(arrObj);
        await myDb.addToCart.destroy({
            where: {
                UserId: req.decoded.UserId
            }
        })
        for (let i = 0; i < arrObj.length; i++) {
            const productDetails = await myDb.product.findAll({
                where: {
                    ProductId: arrObj[i].ProductId
                }
            })
            let quantity = productDetails[0].stocks - arrObj[i].quantity
            await myDb.product.update({ stocks: quantity }, {
                where: {
                    ProductId: arrObj[i].ProductId
                }
            })
        }
        return res.json({
            message: "order placed",
        })
    } catch (error) {
        next(error)
    }
}


// Current..............
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
                req.status = decoded.status;
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
            let customerdata = await customer.findOne({
                where: {
                    email: req.email
                }
            });
            if (customerdata == null) {
                const bcryptpassword = await bcrypt.hash(password + "", 12);
                let dataToSet = {
                    email: email,
                    name: name,
                    mobile: mobile,
                    password: bcryptpassword,
                    status: 1
                }
                let data = await customer.create(dataToSet);
                const theToken = jwt.sign({ id: data.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
                res.json({
                    status: 200,
                    result: "success",
                    message: "Customer successfully registered!",
                    token: theToken,
                    data: data

                })
            } else {
                res.json({
                    status: 404,
                    result: "error",
                    message: "Email already exists!"
                })
            }
        } else {
            res.json({
                status: 404,
                result: "error",
                message: "Email mismatch!"
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: " catch error"

        })
    }

}
exports.updateProduct = async (req, res, next) => {
    try {
        const getProduct = await product.findAll({
            where: { ProductId: req.body.ProductId }
        })
        //console.log(getProduct[0].stock);
        let stock = req.body.stock ?? 0
        stock = stock + parseInt(getProduct[0].dataValues.stock)
        console.log(stock);
        const prevDiscount = getProduct[0].discountPercent
        const prevOrignalPrice = getProduct[0].orignalPrice
        const discountPercent = req.body.discountPercent ?? prevDiscount;
        console.log(discountPercent);
        const orignalPrice = req.body.orignalPrice ?? prevOrignalPrice;
        console.log(orignalPrice);
        const price = parseFloat(orignalPrice) - (parseFloat(orignalPrice) * parseFloat(discountPercent)) / 100;
        console.log(price);
        if (getProduct.length === 0) {
            return res.json({
                status: ReasonPhrases.BAD_REQUEST,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Not found any product"
            })
        }
        const updatePro = await product.update({
            stock: stock,
            orignalPrice: orignalPrice,
            dicountPercent: discountPercent,
            price: price
        }, {
            where: {
                [Op.and]: [{ ProductId: req.body.ProductId }, { MerchantId: req.MerchantId }]
            }
        })
        console.log(updatePro);
        if (updatePro[0] === 1) {
            const updatedProduct = await product.findAll({
                where: { ProductId: req.body.ProductId }
            })
            // console.log(updatedProduct);
            const ProductInCart = await addToCart.findAll({
                where: { ProductId: req.body.ProductId }, raw: true
            })
            console.log(ProductInCart);
            let length = ProductInCart.length,
                i = 0;
            while (length > 0) {
                console.log(ProductInCart[i].quantity, 'ggxsyugud')
                let totalAmount = updatedProduct[0].price * (ProductInCart[i].quantity);
                await addToCart.update({
                    price: updatedProduct[0].price, discountPercent: updatedProduct[0].discountPercent
                    , orignalPrice: updatedProduct[0].orignalPrice, totalAmount: totalAmount
                }, {
                    where: { ProductId: req.body.ProductId, CartId: ProductInCart[i].CartId }
                })
                length--;
                i++;
            }
            return res.status(200).json({
                status: ReasonPhrases.OK,
                statusCode: StatusCodes.OK,
                message: "product updated successfully"
            })
        } else {
            return res.status(400).json({
                status: ReasonPhrases.NOT_FOUND,
                statusCode: StatusCodes.NOT_FOUND,
                message: "merchant has not uploaded any product"
            })
        }
    }
    catch (err) {
        next(err);
    }
}



const orderItemInsertion = await orderTable.bulkCreate(arrObj)


// Latest

exports.orderProduct = async (req, res,next) => {
  try {
    //console.log(req.UserId);
    let OrderAddress = req.query.addressId ?? ""
    if(OrderAddress === ""){
      return res.json({
        status : ReasonPhrases.NOT_FOUND,
        StatusCodes : StatusCodes.NOT_FOUND,
        message:"Please Select your address first"
      })
    }
    const address1 = await address.findAll({
      where: { id: OrderAddress },
      attributes: {
        exclude: ["createdAt", "updatedAt", "id", "UserId"],
      },
    });
    //console.log(Object.values(address1[0]));
    const orderAddress = address1[0].address + ", " + address1[0].city + " ," + address1[0].State + " ," + address1[0].PinCode;
    if (address1.length == 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status : ReasonPhrases.NOT_FOUND,
        StatusCodes : StatusCodes.NOT_FOUND,
        message: "please select or add a new address for order ",
      });
    }
    const ProductsFromCart = await addToCart.findAll({
      where: { UserId: req.UserId }, attributes: { exclude: ["CartId", "createdAt", "updatedAt", "status"] ,raw : true}
    })
    if (ProductsFromCart.length == 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status : ReasonPhrases.NOT_FOUND,
        StatusCodes : StatusCodes.NOT_FOUND,
        message: "Nothing is prsent in Cart"
      })
    }
    //////////////////////////////////
    let arr1 = []
    for (i=0 ; i<ProductsFromCart.length ; i++){
      arr1[i] = ProductsFromCart[i].ProductId
    }
    const CartProduct = await product.findAll({
      where :{ProductId : arr1},raw : true
    })
    for(let j =0 ; j<CartProduct.length ; j++){
      if(CartProduct[j].stock<ProductsFromCart[j].quantity){
        return res.json({
          status : ReasonPhrases.NOT_FOUND,
          StatusCodes : StatusCodes.NOT_FOUND,
          message:"Insufficient stock"
        })
      }
    }
    //inserting in Order Table
    const Amount = await addToCart.findAll({
      attributes:
        [[sequelize.fn("SUM",sequelize.col("totalAmount")),"Amount"]],
      group: "UserId"
  })
  console.log(Amount);
  let total = Amount[0].dataValues.Amount
    let shippingCost = 0;
    if (total <= 10000) {
      shippingCost = 100;
      total = total + shippingCost;
    }
    const getUserDetails = await users.findAll({ where: { UserId: req.UserId },raw : true })
    const createOrder = await order.create({
      Name: getUserDetails[0].name,
      address: orderAddress,
      UserId: req.UserId,
      totalPayableAmount: parseFloat(total),
      shippingCost: shippingCost,
    })
    // req.CartProduct = CartProduct;
    // req.ProductsFromCart = ProductsFromCart
    // req.createOrder = createOrder
    //...........................................................
    //console.log(ProductsFromCart,'<---------------');
    let arrObj = []
    console.log((ProductsFromCart));
    for(let inn = 0 ; inn <ProductsFromCart.length ; inn++ ){
      // arrObj[inn] = ProductsFromCart[inn];
      // arrObj[inn].MerchantId = CartProduct[inn].MerchantId
      ProductsFromCart[inn].dataValues.MerchantId=CartProduct[inn].MerchantId
     // arrObj[inn].MerchantId = getMerchantDetail[inn].MerchantId
      // arrObj[inn].OrderId = createOrder.OrderId
      ProductsFromCart[inn].dataValues.OrderId=createOrder.OrderId
      arrObj[inn]=ProductsFromCart[inn].dataValues
    }
    console.log(arrObj,'hello');
    const orderItemInsertion = await orderItem.bulkCreate(arrObj)
    //stocks update
  //   let pd=[]
  //   for(let i=0;i<ProductsFromCart.length;i++){
  //       CartProduct[i].stock -= ProductsFromCart[i].quantity
  //       pd[i]=CartProduct[i]
  //   }
  //   await product.bulkCreate(pd,{
  //     updateOnDuplicate:['stock']
  // })
  //   //deleting from userCart
  //           // await addToCart.destroy({
  //           //     where: { UserId: req.UserId }
  //           //   })
    //.................................................................
    return res.json({
      status : ReasonPhrases.OK,
      StatusCodes : StatusCodes.OK,
      message: "order Placed"
    })
  } catch (err) {
    next(err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                error: ReasonPhrases.INTERNAL_SERVER_ERROR,
                message: (err.message),
            })
  }
}
exports.afterPayment = async(req , res , next) =>{
  try{
    const {UserId} = await order.findOne({
      where :{OrderId : req. body . OrderId}
    })
    const ProductsFromCart1 = await addToCart.findAll({
      where: { UserId: UserId }, attributes: { exclude: ["CartId", "createdAt", "updatedAt", "status"] ,raw : true}
    })
    let arr1 = []
    for (i=0 ; i<ProductsFromCart1.length ; i++){
      arr1[i] = ProductsFromCart1[i].ProductId
    }
    const CartProduct1 = await product.findAll({
      where :{ProductId : arr1},raw : true
    })
    let pd=[]
    for(let i=0;i<ProductsFromCart1.length;i++){
        CartProduct1[i].stock -= ProductsFromCart1[i].quantity
        pd[i]=CartProduct1[i]
    }
    await product.bulkCreate(pd,{
      updateOnDuplicate:['stock']
  })
    //deleting from userCart
            // await addToCart.destroy({
            //     where: { UserId: UserId }
            //   })
            return res.json({
              message:"payment done successfully"
            })
  }catch(err){
    next(err)
  }
}