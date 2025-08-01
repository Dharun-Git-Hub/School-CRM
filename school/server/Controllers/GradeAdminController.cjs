const { decryptRandom, encryptRandom } = require("../Helpers/Cryptors.cjs");
const { sendOTP, validateOTP, generateID, sendForgotLink } = require("../Helpers/SendEmail.cjs");
const GradeAdmin = require("../Schemas/GradeAdmin/GradeAdminLoginSchema.cjs");
const Teacher = require("../Schemas/Teacher/TeacherSchema.cjs")
const Subject = require('../Schemas/Subject/SubjectSchema.cjs')
const Grade = require('../Schemas/GradeAdmin/GradeSchema.cjs')
const Student = require('../Schemas/Student/StudentSchema.cjs')
const Section = require('../Schemas/Section/SectionSchema.cjs')
const Logs = require('../Schemas/Logs/LogSchema.cjs')
const fs = require('fs')
const xlsx = require('xlsx')
const jwt = require('jsonwebtoken');
const Timetable = require("../Schemas/TimeTable/TimeTableSchema.cjs");
const jwtsecret = 'jwtsecret'


exports.login = async(req,res) => {
    const {details} = req.body;
    console.log(details);
    const decrypted = JSON.parse(decryptRandom(details));
    console.log('Decrypted: ',decrypted)
    const exists = await GradeAdmin.findOne({email:decrypted.email, password: decrypted.password})
    if(!exists)
        return res.json({status:"failure",message: "Invalid Email or Password!"});
    if(exists){
        sendOTP(exists.email)
    }
    await Logs.insertOne({action:`Grade Admin with email: ${decrypted.email} logged in !`,who: `Grade Admin with MailID: ${decrypted.email}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
    return res.json({status:"success"})
}

exports.validateToken = async(req,res) => {
    const {token} = req.body;
    const decrypted = decryptRandom(token);
    try{
        const decoded = jwt.verify(decrypted,jwtsecret);
        console.log(decoded)
        return res.json({status: "success", userDetails: encryptRandom(JSON.stringify(decoded))})
    }
    catch(err){
        console.log(err)
        return res.json({status: "failure",message: "Something went wrong!"})
    }
}

exports.verifyOTP = (req,res) => {
    const {from,otp} = req.body;
    console.log(from,otp)
    if(validateOTP(from,Number(otp))){
        const token = jwt.sign({email:from},jwtsecret,{expiresIn: "50m"})
        console.log(token);
        return res.json({status:"success", token: token})
    }
    return res.json({status:"failure",message:"Invalid OTP"})
}

exports.getMyGrade = async (req,res) => {
    const {email} = req.body;
    console.log('EMAIL: ',email)
    const exists = await GradeAdmin.findOne({email:email})
    if(!exists)
        return res.json({status:"failure"})
    console.log(exists)
    return res.json({status:"success",grade:exists.grade})
}

const idStore = new Map()

exports.sendLink = async (req,res) => {
    const {email} = req.body;
    const decrypted = JSON.parse(decryptRandom(email));
    console.log(decrypted)
    const exists = await GradeAdmin.exists({email:decrypted.email})
    console.log(exists)
    if(!exists) return res.json({status:"failure",message:"Invalid Registered Email!"})
    const id = generateID()
    idStore.set(decrypted.email,id);
    console.log(idStore)
    try{
        sendForgotLink(encryptRandom(decrypted.email),encryptRandom(id),"grade-admin-link");
        await Logs.insertOne({action:`Grade Admin with email: ${decrypted.email} requested to change password`,who: `Grade Admin with MailID: ${decrypted.email}`,to:["Super"],time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`})
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
        await GradeAdmin.updateOne({email: decrypted.email},{$set:{password:decrypted.newpassword}})
        await Logs.insertOne({action:`Grade Admin with email: ${decrypted.email} just changed his password as ${decrypted.newpassword} !`,who: `Grade Admin with MailID: ${decrypted.email}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
        return res.json({status:"success"})
    }
    catch(err){
        idStore.delete(decryptRandom(decrypted.email))
        return res.json({status:"failure"})
    }
}

exports.uploadExcel = async (req,res) => {
    console.log(req.file)
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    const myGrade = req.body.myGrade
    console.log(myGrade)
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Code")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name,Code] Property!`})
                }
                catch(err){}
            }
        })
        let data = []
        worksheet.map((el)=>{
            const {Name,Code} = el;
            const grades = [myGrade]
            let temp = {
                name: Name,
                code: Code,
                grade: grades,
            }
            data.push(temp)
        })
        console.log(data)
        for(let i of data){
            const exists = await Subject.findOne({name: i.name, code: i.code})
            console.log(exists)
            console.log(i)
            if(exists){
                if(exists.grade.includes(i.grade[0])){
                    return res.json({status:"failure",message:'Subject(s) already found!'})
                }
                else{
                    await Subject.updateOne({name: exists.name, code: exists.code},{$push: {grade:i.grade[0]}})
                    data = data.filter(el=>el.code !== i.code)
                }
            }
        }
        console.log('After Filter',data)
        try{
            await Subject.insertMany(data)
            await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} created some subjects with excel file at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,to:["Super"]})
            return res.json({status:"success"})
        }
        catch(err){
            console.log(err)
            return res.json({status:"failure",message:"Duplicate Subject Code Detected!"})
        }
    }
    else{
        console.log('NULL')
    }
}

exports.uploadManual = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details)).fields
    const myGrade = JSON.parse(decryptRandom(details)).myGrade
    console.log(myGrade)
    let data = []
    decrypted.map((el)=>{
        const {subjectName, subjectCode, selected} = el
        let temp = {
            name: subjectName,
            code: subjectCode,
            grade: selected,
        }
        console.log(temp)
        data.push(temp)
    })
    for(let i of data){
        const exists = await Subject.findOne({name: i.name, code: i.code})
        console.log(exists)
        console.log(i)
        if(exists){
            if(exists.grade.includes(i.grade[0])){
                return res.json({status:"failure",message:'Subject(s) already found!'})
            }
            else{
                await Subject.updateOne({name: exists.name, code: exists.code},{$push: {grade:i.grade[0]}})
                data = data.filter(el=>el.code !== i.code)
            }
        }
    }
    console.log('After Filter',data)
    try{
        await Subject.insertMany(data)
        await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} created some subjects manually at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
        return res.json({status:"success"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.addGradeManually = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    try{
        await Grade.insertMany(decrypted)
        return res.json({status:"success"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getGrades = async (req,res) => {
    const pipeline = [
        {
            $project: {
                _id: 0,
                grade: 1,
            }
        }
    ]
    try{
        const response = await Grade.aggregate(pipeline)
        console.log(response)
        const listed = response.map((el)=>el.grade)
        console.log('Listed',listed)
        return res.json({status:"success",list:listed})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"No Grades Found!"})
    }
}

exports.addTeacherManually = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details)).fields
    console.log(decrypted)
    const myGrade = JSON.parse(decryptRandom(details)).myGrade
    for(const el of decrypted){
        const exists = await Subject.findOne({name: el.subject,code: el.code})
        if(!exists){
            return res.json({status:"failure",message:`Subject ${el.subject} not found!`});
        }
        if(!exists.grade.some(e=>e==el.grade)){
            return res.json({status:"failure",message:`The grade ${el.grade} has no subject named: ${el.subject}!`});
        }
    }
    for(const el of decrypted){
        const exists = await Teacher.findOne({
            name: el.name,
            email: el.email,
            phone: el.phone,
            grade: el.grade,
            section: el.section,
            subject: el.subject,
            code: el.code,
        });
        const foundMaster = await Teacher.exists({grade: el.grade, section: el.section})
        if(exists || foundMaster){
            return res.json({status:"failure",message:`Teacher already found!`});
        }
    }
    try{
        const data = []
        for(const i of decrypted){
            data.push({...i,password:"STAFF"})
        }
        console.log(data)
        await Teacher.insertMany(data)
        await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} appointed teacher(s) manually at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
        return res.json({status: "success"})
    }
    catch(err){
        console.log(err)
        return res.json({status: "failure", message: "Something went wrong!"})
    }
}

exports.addTeacherByExcel = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    const myGrade = req.body.myGrade
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Email") || !el.hasOwnProperty("Phone") || !el.hasOwnProperty("Role") || !el.hasOwnProperty("Grade") || !el.hasOwnProperty("Section") || !el.hasOwnProperty("Subject") || !el.hasOwnProperty("Code")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Email, Phone, Role, Grade, Section, Subject, Code] Properties!`})
                }
                catch(err){}
            }
        })
        for(const el of worksheet){
            const exists = await Section.exists({name: el.Section})
            if(!exists) return res.json({status:"failure",message: `Invalid Section: ${el.Section}`})
        }
        const pipeline = [
            {
                $project: {
                    _id: 0,
                    grade: 1,
                }
            }
        ]
        const pipeline2 = [
            {
                $project: {
                    _id: 0,
                    name: 1,
                }
            }
        ]
        const gradeList = await Grade.aggregate(pipeline)
        const subjectList = await Subject.aggregate(pipeline2)
        gradeList.map((el)=>console.log(Number(el.grade)))
        worksheet.map((el)=>{
            const exists = gradeList.find(e=>Number(e.grade)===el.Grade)
            console.log(el)
            if(!exists){
                return res.json({status:"failure",message:`Invalid Grade: ${el.Grade}`})
            }
        })
        worksheet.map((el)=>{
            const exists = subjectList.find(e=>e.name==el.Subject)
            if(!exists){
                return res.json({status:"failure",message:`Invalid Subject: ${el.Subject}`})
            }
        })
        const data = [];
        worksheet.forEach((el)=>{
            const { Name, Email, Phone, Role, Grade, Section, Subject, Code } = el;
            let temp = {
                name: Name,
                email: Email,
                phone: Phone,
                role: Role,
                grade: Grade,
                section: Section,
                subject: Subject,
                code: Code,
                password: "STAFF"
            };
            data.push(temp);
        });
        for(const el of data){
            const exists = await Teacher.findOne({
                name: el.name,
                email: el.email,
                phone: el.phone,
                grade: el.grade,
                section: el.section,
                subject: el.subject,
                code: el.code,
            });
            const foundMaster = await Teacher.exists({grade: el.grade, section: el.section})
            if(exists || foundMaster){
                return res.json({status:"failure",message:`Teacher already found!`});
            }
        }
        try{
            for(const el of data){
                const exists = await Subject.findOne({name: el.subject, code: el.code})
                if(!exists){
                    return res.json({status:"failure",message:`Subject ${el.subject} not found!`});
                }
                if(!exists.grade.some(e=>e==el.grade)){
                    return res.json({status:"failure",message:`The grade ${el.grade} has no subject named: ${el.subject}!`});
                }
            }
            await Teacher.insertMany(data);
            await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} appointed teacher(s) using excel file at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
            return res.json({status:"success"});
        }
        catch(err){
            console.log(err);
            return res.json({status:"failure", message:"Something went wrong!"});
        }
    }
    else{
        console.log('NULL')
        return res.json({status:"failure", message:"Please give the xlsx file first!"});
    }
}

exports.addStudentManually = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details)).fields
    console.log('Logging...',decrypted)
    const myGrade = JSON.parse(decryptRandom(details)).myGrade
    const modified = [];
    try{
        decrypted.map((el)=>{
            const temp = {
                name: el.name,
                roll: el.roll,
                dob: el.dob,
                gender: el.gender,
                grade: el.grade,
                section: el.section,
                admission_no: el.adno,
                academic_year: el.acyear,
                address: el.address,
                attendance: 0,
                email: el.email,
                password: "ADMIN"
            }
            modified.push(temp)
        })
        for(const el of modified){
            console.log(el)
            const exists = await Section.exists({name:el.section,grade:el.grade})
            console.log(exists)
            if(!exists) return res.json({status:"failure",message:"One of the section(s) not found!"})
        }
        for(const el of modified){
            console.log(el)
            const exists = await Student.exists({admission_no: el.admission_no, academic_year: el.academic_year, email: el.email})
            console.log(exists)
            if(exists) return res.json({status:"failure", message: "Student Already found!"})
        }
        for(const el of modified){
            const exists = await Student.exists({grade: el.grade, section: el.section, roll: el.roll})
            console.log(exists)
            if(exists) return res.json({status:"failure", message: "Same Roll Number already found!"})
        }
        await Student.insertMany(modified)
        for(const el of modified){
            await Section.updateOne(
                {name: el.section, grade: el.grade},
                {
                    $push: {
                        students: {
                            name: el.name,
                            roll: el.roll,
                            dob: el.dob,
                            gender: el.gender,
                            grade: el.grade,
                            section: el.section,
                            admission_no: el.adno,
                            academic_year: el.acyear,
                            address: el.address,
                            attendance: 0,
                            email: el.email,
                        }
                    }
                }
            )
        }
        await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} registered student(s) manually at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
        return res.json({status:"success"})
    }
    catch(err){
        console.log(err)
        return res.json({status: "failure", message: "Something went wrong!"})
    }
}

exports.addStudentByExcel = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    const myGrade = req.body.myGrade
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Email") || !el.hasOwnProperty("Roll") || !el.hasOwnProperty("DOB") || !el.hasOwnProperty("Gender") || !el.hasOwnProperty("Grade") || !el.hasOwnProperty("Section") || !el.hasOwnProperty("Admission_No") || !el.hasOwnProperty("Academic_Year") || !el.hasOwnProperty("Address")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Roll, DOB, Gender, Grade, Section, Admission_No, Academic_Year, Email and Address] Properties!`})
                }
                catch(err){
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Roll, DOB, Gender, Grade, Section, Admission_No, Academic_Year, Email and Address] Properties!`})
                }
            }
        })
        const pipeline = [
            {
                $project: {
                    _id: 0,
                    grade: 1,
                }
            }
        ]
        const gradeList = await Grade.aggregate(pipeline)
        gradeList.map((el)=>console.log(Number(el.grade)))
        worksheet.map((el)=>{
            const exists = gradeList.find(e=>Number(e.grade)===el.Grade)
            console.log(el)
            if(!exists){
                return res.json({status:"failure",message:`Invalid Grade: ${el.Grade}`})
            }
        })
        console.log(worksheet)
        const pipelineSection = [
            {
                $project: {
                    _id: 0,
                    name: 1,
                    grade: 1,
                }
            }
        ]
        const list = await Section.aggregate(pipelineSection)
        console.log('Sections',list)
        for(const el of worksheet){
            const exists = list.filter(e=>Number(e.grade) === el.Grade)
            console.log(exists)
            const proceed = exists.some(e=>e.name === el.Section)
            if(!proceed)
                return res.json({status:"failure",message:"Please insert a valid Grade & Section!"})
        }
        const data = [];
        worksheet.forEach((el)=>{
            const { Name, Roll, Email, DOB, Gender, Grade, Section, Admission_No, Academic_Year, Address } = el;
            let temp = {
                name: Name,
                roll: Roll,
                dob: new Date(DOB),
                gender: Gender,
                grade: Grade,
                section: Section,
                admission_no: Number(Admission_No),
                academic_year: Academic_Year,
                address: Address,
                password: "ADMIN",
                email: Email,
            };
            data.push(temp);
        });
        console.log('Excel: ',data)
        for(const el of data){
            console.log(el)
            const exists = await Section.exists({name:el.section,grade:el.grade})
            console.log(exists)
            if(!exists) return res.json({status:"failure",message:"One of the section(s) not found!"})
        }
        for(const el of data){
            const exists = await Student.findOne({
                $or: [
                    {admission_no: el.admission_no},
                    {email: el.email}
                ]
            });
            if(exists){
                console.log('1st One')
                return res.json({status:"failure",message:`Student already found!`});
            }
        }
        for(const el of data){
            const exists = await Student.findOne({
                name: el.name, grade: el.grade, roll: el.roll, section: el.section
            });
            if(exists){
                console.log('2nd execution')
                return res.json({status:"failure",message:`Student already found!`});
            }
        }
        try{
            await Student.insertMany(data);
            for(const el of data){
                await Section.updateOne(
                    {name: el.section, grade: el.grade},
                    {$push: {students: {
                        name: el.name,
                        roll: el.roll,
                        dob: el.dob,
                        gender: el.gender,
                        grade: el.grade,
                        section: el.section,
                        admission_no: el.adno,
                        academic_year: el.acyear,
                        address: el.address,
                        attendance: 0,
                        email: el.email,
                    }} }
                )
            }
            await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} appointed student(s) using excel at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
            return res.json({status:"success"});
        }
        catch(err){
            console.log(err);
            return res.json({status:"failure", message:"Something went wrong!"});
        }
    }
    else{
        console.log('NULL')
    }
}

exports.getSubjects = async (req,res) => {
    try{
        const pipeline = [
            {
                $project: {
                    _id: 0,
                    name: 1
                }
            }
        ]
        const response = await Subject.aggregate(pipeline)
        console.log(response)
        const listed = []
        response.map((el)=>listed.push(el.name))
        return res.json({status:"success",list: listed})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure", message: "Something went wrong!"})
    }
}

exports.uploadSectionManually = async(req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details)).fields
    console.log(decrypted)
    const myGrade = JSON.parse(decryptRandom(details)).myGrade
    for(const el of decrypted){
        const exists = await Section.exists({name: el.name, grade: el.grade})
        if(exists)
            return res.json({status:"failure",message:"Section with this Grade is already found!"})
    }
    try{
        await Section.insertMany(decrypted)
        await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} created section(s) manually file at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
        return res.json({status:"success",message:"Section(s) Created!"});
    }
    catch(err){
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.uploadSectionByExcel = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    const myGrade = req.body.myGrade
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Grade")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Grade] Properties!`})
                }
                catch(err){}
            }
        })
        for(const i of worksheet){
            if(i.Grade != myGrade){
                return res.json({status:"failure",message:`Please enter your grade only (${myGrade})`})
            }
        }
        for(const el of worksheet){
            const exists = await Section.exists({name: el.Name, grade: el.Grade})
            if(exists)
                return res.json({status:"failure",message:"Section with this Grade is already found!"})
        }
        const pipeline = [
            {
                $project: {
                    _id: 0,
                    grade: 1,
                }
            }
        ]
        const gradeList = await Grade.aggregate(pipeline)
        gradeList.map((el)=>console.log(Number(el.grade)))
        const data = [];
        console.log(worksheet)
        for(const el of worksheet){
            const exists = gradeList.some(e=>Number(e.grade)===el.Grade)
            if(!exists)
                return res.json({status:"failure",message:"Please insert a valid Grade!"})
            data.push({name: el.Name, grade: el.Grade})
        }
        try{
            await Section.insertMany(data);
            await Logs.insertOne({action:`Grade Admin of Grade: ${myGrade} registered section(s) using excel at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${myGrade}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
            return res.json({status:"success", message: "Section(s) Created!"});
        }
        catch(err){
            console.log(err);
            return res.json({status:"failure", message:"Something went wrong!"});
        }
    }
    else{
        console.log('NULL')
    }
}

exports.getSections = async (req,res) => {
    const {details} = req.body
    console.log('My Grade Input: ',details)
    try{
        const list = await Section.find({grade:details})
        console.log('Section List: ',list)
        return res.json({status:"success",list:list})
    }
    catch(err){
        return res.json({status:"failure"})
    }
}

exports.getStaff = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    try{
        const exists = await Teacher.find({grade: decrypted.grade})
        console.log(exists)
        if(!exists){
            return res.json({status:"failure",message:"Staff Not Found for this section!"})
        }
        return res.json({status:"success",list:exists})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.addTimeline = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    const exists = await Timetable.exists(
        {
            "timeslots.day":decrypted.timeslots.day,
            "timeslots.period":decrypted.timeslots.period,
            "timeslots.teacher":decrypted.timeslots.teacher,
        }
    )
    if(exists){
        return res.json({status:"failure",message:"This staff already has a class at this time!"})
    }
    try{
        await Timetable.insertOne(decrypted)
        await Logs.insertOne({action:`Grade Admin of Grade: ${decrypted.gradeID} added a Timeline/Timeslot for staff: ${decrypted.timeslots.teacher} for Day: ${decrypted.timeslots.day} - Period: ${decrypted.timeslots.period} at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${decrypted.gradeID}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
        return res.json({status:"success",message:"Successfully created!"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getTimeline = async (req,res) => {
    const {details} = req.body
    const {gradeId,sectionId} = JSON.parse(decryptRandom(details))
    console.log('Grade: ',gradeId)
    console.log('Section: ',sectionId)
    try{
        const result = await Timetable.find({gradeID: gradeId,sectionID: sectionId})
        return res.json({status:"success",list:result})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.deleteTimeline = async (req,res) => {
    const {toRetain} = req.body;
    const decrypted = JSON.parse(decryptRandom(toRetain))
    console.log('Retain Request: ',decrypted)
    const exists = await Timetable.findOne({gradeID: decrypted.gradeID, sectionID: decrypted.sectionID, academicYear: decrypted.academicYear,
        "timeslots.day":decrypted.timeslots.day,
        "timeslots.period":decrypted.timeslots.period,
        "timeslots.startTime":decrypted.timeslots.startTime,
        "timeslots.subject": decrypted.timeslots.subject,
        "timeslots.teacher": decrypted.timeslots.teacher,
    })
    console.log(exists)
    if(!exists)
        return res.json({status:"failure",message:"Schedule before delete!"});
    try{
        await Timetable.deleteOne({gradeID: decrypted.gradeID, sectionID: decrypted.sectionID, academicYear: decrypted.academicYear,
            "timeslots.day":decrypted.timeslots.day,
            "timeslots.period":decrypted.timeslots.period,
            "timeslots.startTime":decrypted.timeslots.startTime,
            "timeslots.subject": decrypted.timeslots.subject,
            "timeslots.teacher": decrypted.timeslots.teacher,
        })
        await Logs.insertOne({action:`Grade Admin of Grade: ${decrypted.gradeID} deleted a Timeline/Timeslot of ${decrypted.timeslots.teacher} for Day: ${decrypted.timeslots.day} - Period: ${decrypted.timeslots.period} at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,who:`Grade Admin of Grade: ${decrypted.gradeID}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super"]})
        return res.json({status:"success", message: "Timeline Deleted"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message: "Something went wrong!"})
    }
}

exports.logs = async(req,res) => {
    try{
        const response = await Logs.find({
            to: {
                $in: "Grade"
            }
        })
        console.log(response)
        return res.json({status:"success",list:response})
    }
    catch(err){
        return res.json({status:"failure",message:"Something went wrong"})
    }
}

exports.getStaffNames = async (req,res) => {
    const {theGrade} = req.body;
    try{
        const response = await Teacher.find({grade:theGrade})
        console.log(response)
        const list = []
        for(let i of response){
            list.push({email:i.email,section:i.section})
        }
        return res.json({status:"success",list})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong"})
    }
}

exports.getCounts = async (req,res) => {
    const {details} = req.body;
    try{
        const studentsCount = await Student.find({grade:details}).countDocuments()
        const teachersCount = await Teacher.find({grade:details}).countDocuments()
        const sectionsCount = await Section.find({grade:details}).countDocuments()
        const subjectsCount = await Subject.find({
            grade: { $in: details }
        }).countDocuments()
        return res.json({status:'success',countList:{studentsCount,teachersCount,subjectsCount,sectionsCount}})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong"})
    }
}