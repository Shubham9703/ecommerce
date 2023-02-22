const nodemailer = require("nodemailer");


module.exports = {
    sendMail(email, subject, text, callback) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "shubham.k@appventurez.com",
                pass: ""
            }
        });
        const mailOptions = {
            from: "shubham.k@appventurez.com",
            to: email,
            subject: subject,
            text: text
        }
        transporter.sendMail(mailOptions, (error, result) => {
            if (error) {
                console.log(error);
                callback(error, null);
            } else {
                console.log("Email sent: " + result.response);
                callback(null, result.response);
            }
        });
    },
    getOtp() {
        let otp = Math.floor((Math.random() * 1000) + 1000);
        return otp;
    },



  
}
