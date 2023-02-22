const Joi = require("joi");

const sendOtpvalidation = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().required().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }),
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
const customerRegValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        name: Joi.string().required().pattern(new RegExp('^[a-zA-Z]{3,30}$')),
        email: Joi.string().required().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }),
        password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$")), //pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        mobile: Joi.number().required().min(10).max(10)
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
const loginValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string(),
        mobile: Joi.number().min(10).max(10),
        password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$"))
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
// .....Customer Validation..........
const CstmrvalidationAddress = (req, res, next) => {
    const schema = Joi.object().keys({
        address: Joi.string().required(),
        city: Joi.string().required(),
        State: Joi.string().required(),
        zip_code: Joi.number().required(),
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
const merchantRegValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }),
        companyName: Joi.string().required(),
        mobile: Joi.number().required().min(10).max(10),
        // gstNumber: Joi.string().required().min(15).max(15),
        // address: Joi.string().required(),
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
// ..........
const validationOTP = (req, res, next) => {
    const schema = Joi.object().keys({
        otp: Joi.string()
            .length(4)
            .pattern(/^[0-9]+$/)
            .required(),
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next-----");
        next();
    }
}
const merchantPasswordValid = (req, res, next) => {
    const schema = Joi.object().keys({
        newPassword: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$")),
        confirmPassword: Joi.string().required() .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{3,30}$"))
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
const categoryValid=(req,res,next)=>{
    const schema = Joi.object().keys({
        category: Joi.string().required()
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
const SubcategoryValid=(req,res,next)=>{
    const schema = Joi.object().keys({
        subCategory: Joi.string().required(),
        CategoryId: Joi.string().required()
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}

const addProductValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        hsnCode: Joi.number().required(),
        pName: Joi.string().required(),
        pQuantity: Joi.number().required(),
        CategoryId: Joi.string().required(),
        SubCategoryId: Joi.string().required(),
        originalPrice: Joi.number().required(),
        discountPercent: Joi.number().required(),
        description: Joi.string().required(),
         
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
const updateProdctValidation = (req, res, next) => {
    const schema = Joi.object().keys({
        originalPrice: Joi.number().positive(),
        // id: Joi.string().required(),
        id: Joi.number().required(),
        pQuantity: Joi.number().positive(),
        dicountPercent: Joi.number().positive()
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(200).json(error.message);
        console.log(error);
    }
    else {
        console.log("next");
        next();
    }
}
module.exports = {
    sendOtpvalidation,
    customerRegValidation,
    loginValidation,
    merchantRegValidation,
    CstmrvalidationAddress,
    merchantPasswordValid,
    addProductValidation,
    updateProdctValidation,
    categoryValid,
    SubcategoryValid,




    validationOTP,
    

}