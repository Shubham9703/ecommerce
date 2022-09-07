const merchant = require("../Models/merchant");
const category = require("../Models/category")
const subCategory = require("../Models/subcategory");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const commonFunction = require("../helper/commonFunction");



// Service
const merchantService = require("../service/merchant");
const product = require("../Models/product");
const cart = require("../Models/cart");
const e = require("express");

// ********************* MERCHANT MANAGEMENT************************************

//Registraction...............
exports.registerMerchant = async function (req, res, next) {
    try {
        const { name, email, companyName, productTypes } = req.body;
        // let criteria = {
        //     email: email,
        //     // status:1
        // }
        // let exMerchant = await merchantService.checkCustomer(criteria);
        // if (exMerchant) {
        //     return res.json({
        //         status: 400,
        //         result: "error",
        //         message: "Merchant already registered!"
        //     });
        // }
        let dataToSet = {
            name: name,
            email: email,
            companyName: companyName,
            productTypes: productTypes


        }
        const Merchant = await merchantService.createMerchant(dataToSet);
        if (Merchant) {
            const theToken = jwt.sign({ id: Merchant.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
            return res.json({
                status: 200,
                result: "success",
                message: "Merchant registraction is under processing!",
                token: theToken,
                data: Merchant
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

// Set Password
exports.setPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        let criteria = {
            // email: email
            id: req.id
        };
        if (newPassword == confirmPassword) {
            let dataToSet = {
                password: await bcrypt.hash(newPassword + "", 12)
            }
            const user = merchantService.setPassword(criteria, dataToSet);
            return res.json({
                status: 200,
                result: "success",
                message: "Password set successfully",
                // data: dataToSet
            })
        } else {
            return res.json({
                status: 401,
                result: "error",
                message: "Invalid credentials: password and confirm password does't match"
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

//Login...................
exports.merchantLogin = async (req, res, next) => {
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
    let Merchant = await merchantService.checkMerchant(criteria);
    if (Merchant) {
        const merchantJsn = JSON.parse(JSON.stringify(Merchant));
        const isEqual = await bcrypt.compare(password, merchantJsn.password);
        if (isEqual) {
            delete merchantJsn.password;
            const theToken = jwt.sign({ id: Merchant.id }, 'the-super-strong-secrect', { expiresIn: '2h' });
            return res.json({
                status: 200,
                result: "success",
                message: "Merchant login successfully",
                token: theToken,
                data: merchantJsn
            });
        } else {
            return res.json({
                status: 400,
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
}

// Add all 
exports.add = async function (req, res, next) {
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, 'the-super-strong-secrect', (err, decoded) => {
                console.log(err);
                if (err) {
                    return res.json({
                        status: 404,
                        message: `Invalid token or unauthorised access`
                    })
                }
                req.id = decoded.id;
            })
        } else {
            console.log(token);
            res.json({
                status: 303,
                message: 'Please provide token'
            });
        }
        const originalPrice = req.body.originalPrice
        const discountPercent = req.body.discountPercent
        const { Category, Subcategory, pName, pQuantity, price, hsnCode, description } = req.body;
        // Add Category
        let dataToSet1 = {
            category: Category,
        };
        const add_category = await category.findOrCreate({
            where: dataToSet1
        });
        // Add Subcategory
        let dataToSet2 = {
            Subcategory: Subcategory,
            CategoryId: add_category[0].id
        }
        const add_subcategory = await subCategory.findOrCreate({
            where: dataToSet2
        });
        // Add product
        let dataToSet3 = {
            pName: pName,
            pQuantity: pQuantity,
            originalPrice: originalPrice,
            discountPercent: discountPercent,
            price: parseFloat(originalPrice) - (parseFloat(originalPrice) * parseFloat(discountPercent)) / 100,
            CategoryId: add_category[0].id,
            SubCategoryId: add_subcategory[0].id,
            MerchantId: req.id,
            hsnCode: hsnCode,
            description: description
        };
        const add_product = await product.findOrCreate({
            where: dataToSet3
        });
        return res.json({
            status: 200,
            result: "success",
            message: " Category & Subcategory & product added successfully",
            data: [add_category, add_subcategory, add_product]
        })

    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "catch error",

        });
    }
}

// Add category
exports.addCategory = async function (req, res, next) {
    try {
        const { category } = req.body;
        let criteria = {
            category: category
        }
        const exCategory = await merchantService.checkCategory(criteria)
        if (exCategory) {
            return res.json({
                status: 400,
                result: "success",
                message: "Category already exists",
                data: exCategory
            })
        } else {
            let dataToSet = {
                category: category
            };
            const add_category = await merchantService.addCategory(dataToSet);
            if (add_category) {
                return res.json({
                    status: 200,
                    result: "success",
                    message: "Category successfully created",
                    data: dataToSet
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "Catch error"

        });
    }
}

// Add subcategory
exports.addsubCategory = async function (req, res, next) {
    try {
        const categoryData = await category.findOne({
            where: { id: req.body.CategoryId }
        })
        if (categoryData) {
            const exSubCategory = await subCategory.findOne({
                where: { SubCategory: req.body.SubCategory }
            })
            if (exSubCategory) {
                return res.json({
                    status: 400,
                    message: "Subcategory already exists"
                })
            } else {
                let Data={
                    CategoryId:req.body.CategoryId,
                    Subcategory:req.body.SubCategory
                }
                const SubCategory = await subCategory.create(Data)
                return res.json({
                    status: 200,
                    result: "success",
                    message: "Subcategory successfully creted",
                    data:SubCategory
                })
            }
        } else {
            return res.json({
                status: 404,
                result: "error",
                message: "Category Doesn't exist"
            })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            status: 500,
            result: "error",
            message: "Catch error"

        });
    }
}

// Add product
exports.addProduct = async function (req, res, next) {
    try {
        const getCategory = await category.findOne({
            where: { id: req.body.CategoryId }
        })
        if (getCategory) {
            // const getSubcategory = await subCategory.findOne({
            //     where: { id: req.body.SubCategoryId }
            // })
            // if (getSubcategory) {
            //     const exproduct = await product.findOne({
            //         where: { hsnCode: req.body.hsnCode }
            //     })
            //     if (exproduct) {
            //         return res.json({
            //             status: 400,
            //             result: "",
            //             message: "Product already exists",
            //             data:exproduct
            //         })
                // } else {
                    console.log(req.id);
                    const { CategoryId, SubCategoryId, pName, pQuantity, hsnCode, description, originalPrice, discountPercent } = req.body;
                    let dataToSet = {
                        pName: pName,
                        pQuantity: pQuantity,
                        originalPrice: originalPrice,
                        discountPercent: discountPercent,
                        price: parseFloat(originalPrice) - (parseFloat(originalPrice) * parseFloat(discountPercent)) / 100,
                        CategoryId: CategoryId,
                        // SubCategoryId: SubCategoryId,
                        MerchantId: req.id,
                        // hsnCode: hsnCode,
                        description: description

                    };
                    const add_product = await merchantService.addProduct(dataToSet);
                    if (add_product) {
                        return res.json({
                            status: 200,
                            result: "success",
                            message: "Product successfully added",
                            data: add_product
                        })
                    }
                // }
            // } else {
            //     return res.json({
            //         status: 404,
            //         result: "",
            //         message: "Subcategory doesn't exists"
            //     })
            // }
        } else {
            return res.json({
                status: 404,
                result: "",
                message: "Category doesn't exists"
            })
        }

    } catch (error) {
        console.log(error);
    }
}
// update Product and Cart
exports.updateProduct = async function (req, res, next) {
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
        const getProduct = await product.findAll({})
        const PrevQuantity = getProduct[0].pQuantity;
        const pQuantity = parseInt(req.body.pQuantity ?? 0) + parseInt(getProduct[0].pQuantity) ?? PrevQuantity
        const prevDiscount = getProduct[0].discountPercent
        const prevOriginalPrice = getProduct[0].originalPrice
        const discountPercent = req.body.discountPercent ?? prevDiscount;
        const originalPrice = req.body.originalPrice ?? prevOriginalPrice;
        const price = parseFloat(originalPrice) - (parseFloat(originalPrice) * parseFloat(discountPercent)) / 100;
        let dataToSet = {
            pQuantity: pQuantity,
            originalPrice: originalPrice,
            dicountPercent: discountPercent,
            price: price,
        }
        const updateproduct = await product.update(dataToSet, {
            where: {
                id: req.body.id,
                MerchantId: req.id
            }
        })
        if (updateproduct) {
            const updatedProduct = await product.findAll({
                where: { id: req.body.id }
            })
            const cartProduct = await cart.findAll({
                where: { ProductId: req.body.id }, raw: true
            })
            let length = cartProduct.length,
                i = 0;
            while (length > 0) {
                let totalPrice = updatedProduct[0].price * (cartProduct[i].quantity);
                await cart.update({
                    price: updatedProduct[0].price, 
                    dicountPercent: updatedProduct[0].dicountPercent,
                     originalPrice: updatedProduct[0].originalPrice,
                      totalPrice: totalPrice
                }, {
                    where: { ProductId: req.body.id, id: cartProduct[i].id }
                })
                length--;
                i++;
            }
            return res.json({
                status: 200,
                message: "product updated successfully",
                data: [updateproduct]
            })
        }
        else {
            return res.json({
                status: 400,
                message: "merchant is not found for this product"
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

// Delete Product
exports.deleteProduct = async function (req, res, next) {
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
        const deleteproduct = await product.destroy({
            where: {
                [Op.and]: [{ id: req.body.ProductId }, { MerchantId: req.id }]

            }
        })
        if (deleteproduct) {
            return res.json({
                status: 200,
                message: "product deleted successfully",
                data: [deleteproduct]
            })
        } else {
            return res.json({
                status: 404,
                message: "product not found"
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

// Product List
exports.merchantProductList = async (req, res, next) => {
    try {
        let criteria = {
            MerchantId: req.body.id
        }
        let product = await merchantService.productList(criteria);
        if (product) {
            return res.json({
                status: 200,
                result: "success",
                message: "Produt list fetched successfully!",
                data: product
            });
        } else {
            return res.json({
                status: 404,
                result: "Data not found",
                message: "Product not exist's in database",
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
// Sold Poduct List.
exports.merchantSoldProductList = async (req, res, next) => {
    try {
        let criteria = {
            MerchantId: req.id
        }
        console.log(criteria);
        let SoldProduct = await merchantService.SellProductList(criteria);
        if (SoldProduct) {
            return res.json({
                status: 200,
                result: "success",
                message: "Produt  sold list fetched successfully!",
                data: SoldProduct
            });
        } else {
            return res.json({
                status: 404,
                result: "Data not found",
                message: "SoldProduct not exist's in database",
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


