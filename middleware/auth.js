const jwt = require('jsonwebtoken');
const authorize = {
    authorization:(req,res,next)=>{
        let token = req.headers.authorization;
        if(token){
            token = token.split(" ")[1];
            jwt.verify(token,"the-super-strong-secrect",(err,decoded)=>{
                if(err){
                    console.log(err);
                    return res.json({
                        status:404,
                        message:`Invalid token or unauthorised access`
                        // message:"Token expired"
                    })
                }
                req.id = decoded.id;
                req.email=decoded.email;
                // CustomerId= req.id
                next();
            })
        }else{
            console.log(token);
            res.json({
                status:303,
                message:'Please provide token'
            });
        }
    }
}
module.exports = authorize;
