const { decryptRandom, encryptRandom } = require('../Helpers/Cryptors.cjs');
const jwt = require('jsonwebtoken');
const { sendForgotLink, generateID } = require('../Helpers/SendEmail.cjs');
const jwtsecret = 'jwtsecret'
const Student = require('../Schemas/Student/StudentSchema.cjs')
const Assignment = require('../Schemas/Assignment/AssignmentSchema.cjs')
const Attendance = require('../Schemas/Attendance/AttendanceSchema.cjs')
const Logs = require('../Schemas/Logs/LogSchema.cjs')
const fs = require('fs')

exports.login = async(req,res) => {
    const {details} = req.body;
    console.log(details);
    const decrypted = JSON.parse(decryptRandom(details));
    console.log('Decrypted: ',decrypted)
    const exists = await Student.findOne({email:decrypted.email, password: decrypted.password})
    if(!exists)
        return res.json({status:"failure",message: "Invalid Email or Password!"});
    const token = jwt.sign({email:decrypted.email},jwtsecret,{expiresIn: "2m"})
    await Logs.insertOne({action:`Student with email: ${decrypted.email} logged in !`,who: `Student with MailID: ${decrypted.email}`,to:["Super","Grade"]})
    return res.json({status:"success",token:token})
}

exports.validateToken = async(req,res) => {
    const {token} = req.body;
    const decrypted = decryptRandom(token);
    try{
        const decoded = jwt.verify(decrypted,jwtsecret);
        console.log(decoded)
        const details = await Student.findOne({email:decoded.email})
        const extraDetails = {
            ...decoded,
            ...details,
        }
        console.log(extraDetails)
        return res.json({status: "success", userDetails: encryptRandom(JSON.stringify(extraDetails))})
    }
    catch(err){
        console.log(err)
        return res.json({status: "failure",message: "Something went wrong!"})
    }
}

const idStore = new Map()

exports.sendLink = async (req,res) => {
    const {email} = req.body;
    const decrypted = JSON.parse(decryptRandom(email));
    console.log(decrypted)
    const exists = await Student.exists({email:decrypted.email})
    console.log(exists)
    if(!exists) return res.json({status:"failure",message:"Invalid Registered Email!"})
    const id = generateID()
    idStore.set(decrypted.email,id);
    console.log(idStore)
    try{
        sendForgotLink(encryptRandom(decrypted.email),encryptRandom(id),"student-link");
        await Logs.insertOne({action:`Student with email: ${decrypted.email} requested to change password`,who: `Student with MailID: ${decrypted.email}`,to:["Super","Grade"]})
        return res.json({status:"success"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure"})
    }
}

exports.changePassword = async (req,res) => {
    console.log(idStore)
    console.log('Reached me')
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details));
    console.log(decrypted)
    console.log(idStore.get(decrypted.email))
    let registered;
    for(let [mail,id] of idStore){
        if(mail===decrypted.email) registered = id
    }
    console.log(registered)
    if(idStore.get(decrypted.email)===undefined || decrypted.id !== registered)
        return res.json({status:"failure"})
    try{
        idStore.delete(decrypted.email)
        await Student.updateOne({email: decrypted.email},{$set:{password:decrypted.newpassword}})
        await Logs.insertOne({action:`Student with email: ${decrypted.email} just changed his password as ${decrypted.newpassword} !`,who: `Student with MailID: ${decrypted.email}`,to:["Super","Grade"]})
        return res.json({status:"success"})
    }
    catch(err){
        idStore.delete(decryptRandom(decrypted.email))
        return res.json({status:"failure"})
    }
}

exports.getAssignments = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    try{
        const assignments = await Assignment.find({grade:decrypted.grade,section:decrypted.section})
        return res.json({status:"success",list:assignments})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.submitMyAssignment = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    if(file === null){
        return res.json({status: "failure", message: "Upload the assignment file first!"});
    }

    const {student: name, roll, grade, section, date, title, teacher, subject} = req.body;

    try{
        const exists = await Student.exists({name, roll, grade, section});
        if(!exists)
            return res.json({status: "failure", message: "Unauthorized!"});

        const assignmentExists = await Assignment.exists({title, teacher, grade, section, date, subject});
        if(!assignmentExists)
            return res.json({status: "failure", message: "Assignment Not Exists!"});

        const updateExisting = await Assignment.updateOne(
            {
                title,
                teacher,
                grade,
                section,
                date,
                subject,
                "submissions.student": name,
                "submissions.roll": roll
            },
            {
                $set: {
                    "submissions.$.attachment": file,
                    "submissions.$.submitted": true
                }
            }
        );

        if(updateExisting.modifiedCount === 0){
            await Assignment.updateOne(
                { title, teacher, grade, section, date, subject },
                {
                    $push: {
                        submissions: {
                            student: name,
                            roll,
                            attachment: file,
                            submitted: true
                        }
                    }
                }
            );
        }
        await Logs.insertOne({action:`Student with name: ${name}, grade: ${grade}, section: ${section} has Submitted his assignment for the title: ${title} by Teacher: ${teacher}!`,who: `Student with Name: ${name}`,to:["Super","Grade"]})
        return res.json({ status: "success", message: "Assignment Submitted!" });
    }catch (err){
        console.error(err);
        return res.json({ status: "failure", message: "Something went wrong!" });
    }
}

exports.getAttendancePercent = async(req,res) => {
    const {dtls} = req.body;
    const decrypted = JSON.parse(decryptRandom(dtls))
    console.log(decrypted)
    const {section,grade,year,roll} = decrypted
    try{
        const presentDays = await Attendance.find({
            section,grade,year,
            students: { $in: roll }
        }).countDocuments()
        const totalDays = await Attendance.find({
            section,grade,year}).countDocuments()
        console.log('Total Days: ',totalDays)
        const absent = totalDays - presentDays;
        console.log('Present: ',presentDays)
        console.log('Absent: ',absent)
        const percent = (presentDays / totalDays) * 100
        console.log(percent)
        return res.json({status:"success",percentage:percent})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong"})
    }
}