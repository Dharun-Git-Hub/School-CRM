const nodemailer = require('nodemailer')
require('dotenv').config()
const {v4:uuid} = require('uuid')

const OTPSTORE = {}

const generateOTP = () => {
    return Math.floor(Math.random() * (10000-1000) + 1000)
}

const sendOTP = async(to) => {
    const otp = generateOTP()
    OTPSTORE[to] = otp
    console.log('mail username',process.env.mailuser)
    console.log(OTPSTORE)
    const transporter = new nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.mailuser,
            pass: process.env.mailpass,
        }
    })
    const mailOptions = {
        from: 'XXXXXXXXXXXXXX',
        text: `3 Minutes OTP for Schools : ${otp} ! Hurry up!`,
        to: to,
    }
    try{
        await transporter.sendMail(mailOptions);
    }
    catch(err){}
}

const validateOTP = (user,otp) => {
    if(OTPSTORE[user]===otp){
        delete OTPSTORE[user]
        return true
    }
    return false
}

const generateID = () => {
    const id = uuid()
    const str = id.slice(2,10)
    console.log('ID: ',str)
    return str.toString()
}

const sendForgotLink = async(email,id,loc) => {
    console.log('before')
    console.log(id.toString())
    console.log(email.toString())
    console.log('after')
    console.log('ID: ',id.toString().replaceAll('/',')'))
    console.log('EMAIL: ',email.toString().replaceAll('/',')'))
    
    const transporter = new nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.mailuser,
            pass: process.env.mailpass,
        }
    })
    const mailOptions = {
        from: 'XXXXXXXXXXXXXXXXX',
        text: `http://localhost:5173/${loc}/${id.toString().replaceAll('/',')')}/${email.toString().replaceAll('/',')')}`,
        to: email,
    }
    try{
        await transporter.sendMail(mailOptions);
    }
    catch(err){
        console.log(err)
    }
    finally{
        console.log(`http://localhost:5173/${loc}/${id.toString().replaceAll('/',')')}/${email.toString().replaceAll('/',')')}`)
    }
}


module.exports = {sendOTP, validateOTP, generateID, sendForgotLink}
