const { decryptRandom, encryptRandom } = require("../Helpers/Cryptors.cjs");
const { sendOTP, validateOTP, generateID, sendForgotLink } = require("../Helpers/SendEmail.cjs");
const SuperAdmin = require('../Schemas/SuperAdmin/SuperAdminSchema.cjs')
const Attendance = require('../Schemas/Attendance/AttendanceSchema.cjs')
const Subject = require('../Schemas/Subject/SubjectSchema.cjs')
const Grade = require('../Schemas/GradeAdmin/GradeSchema.cjs')
const Teacher = require('../Schemas/Teacher/TeacherSchema.cjs')
const Student = require('../Schemas/Student/StudentSchema.cjs')
const Timetable = require('../Schemas/TimeTable/TimeTableSchema.cjs')
const GradeAdmin = require('../Schemas/GradeAdmin/GradeAdminLoginSchema.cjs')
const Subject = require('../Schemas/Subject/SubjectSchema.cjs')
const Section = require('../Schemas/Section/SectionSchema.cjs')
const Logs = require('../Schemas/Logs/LogSchema.cjs')
const jwt = require('jsonwebtoken')
const jwtsecret = 'jwtsecret'
const fs = require('fs')
const xlsx = require('xlsx')

exports.login = async(req,res) => {
    const {details} = req.body;
    console.log(details);
    const decrypted = JSON.parse(decryptRandom(details));
    console.log('Decrypted: ',decrypted)
    const exists = await SuperAdmin.findOne({email:decrypted.email, password: decrypted.password})
    if(!exists)
        return res.json({status:"failure",message: "Invalid Email or Password!"});
    if(exists){
        sendOTP(exists.email)
    }
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
        const token = jwt.sign({email:from},jwtsecret,{expiresIn: "2m"})
        console.log(token);
        return res.json({status:"success", token: token})
    }
    return res.json({status:"failure",message:"Invalid OTP"})
}

const idStore = new Map()

exports.sendLink = async (req,res) => {
    const {email} = req.body;
    const decrypted = JSON.parse(decryptRandom(email));
    console.log(decrypted)
    const exists = await SuperAdmin.exists({email:decrypted.email})
    console.log(exists)
    if(!exists) return res.json({status:"failure",message:"Invalid Registered Email!"})
    const id = generateID()
    idStore.set(decrypted.email,id);
    console.log(idStore)
    try{
        sendForgotLink(encryptRandom(decrypted.email),encryptRandom(id),"super-admin-link");
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
        await SuperAdmin.updateOne({email: decrypted.email},{$set:{password:decrypted.newpassword}})
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
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Code") || !el.hasOwnProperty("Grades")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name,Code,Grades-[A,B,C]] Property!`})
                }
                catch(err){}
            }
        })
        const data = []
        worksheet.map((el)=>{
            const {Name,Code,Grades} = el;
            const grades = Grades.split(",")
            let temp = {
                name: Name,
                code: Code,
                grade: grades,
            }
            data.push(temp)
        })
        console.log(data)
        try{
            await Subject.insertMany(data)
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
    const decrypted = JSON.parse(decryptRandom(details))
    const data = []
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
    try{
        await Subject.insertMany(data)
        return res.json({status:"success"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Subject already found!"})
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
        return res.json({status:"failure",message:"Grade Already Found!"})
    }
}

exports.addGradeByExcel = async (req,res) => {
    console.log(req.file)
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Grade") || !el.hasOwnProperty("Description")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Grade, Description] Property!`})
                }
                catch(err){}
            }
        })
        const data = []
        worksheet.map((el)=>{
            const {Grade,Description} = el
            let temp = {
                grade: Grade,
                description: Description,
            }
            console.log(temp)
            data.push(temp)
        })
        console.log(data)
        try{
            await Grade.insertMany(data)
            return res.json({status:"success"})
        }
        catch(err){
            console.log(err)
            return res.json({status:"failure",message:"Duplicate Grade Detected!"})
        }
    }
    else{
        console.log('NULL')
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
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    for(const el of decrypted){
        const exists = await Subject.findOne({name: el.subject})
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
        });
        const foundMaster = await Teacher.exists({grade: el.grade, section: el.section})
        if(exists || foundMaster){
            return res.json({status:"failure",message:`Teacher already found!`});
        }
    }
    try{
        await Teacher.insertMany(decrypted)
        return res.json({status: "success"})
    }
    catch(err){
        console.log(err)
        return res.json({status: "failure", message: "Something went wrong!"})
    }
}

exports.addTeacherByExcel = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Email") || !el.hasOwnProperty("Phone") || !el.hasOwnProperty("Role") || !el.hasOwnProperty("Grade") || !el.hasOwnProperty("Section") || !el.hasOwnProperty("Subject")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Email, Phone, Role, Grade, Section and Subject] Properties!`})
                }
                catch(err){}
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
        for(const el of worksheet){
            const exists = await Section.exists({name: el.Section})
            if(!exists) return res.json({status:"failure",message: `Invalid Section: ${el.Section}`})
        }
        worksheet.map((el)=>{
            const exists = subjectList.find(e=>e.name==el.Subject)
            if(!exists){
                return res.json({status:"failure",message:`Invalid Subject: ${el.Subject}`})
            }
        })
        const data = [];
        worksheet.forEach((el)=>{
            const { Name, Email, Phone, Role, Grade, Section, Subject } = el;
            let temp = {
                name: Name,
                email: Email,
                phone: Phone,
                role: Role,
                grade: Grade,
                section: Section,
                subject: Subject,
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
            });
            const foundMaster = await Teacher.exists({grade: el.grade, section: el.section})
            if(exists || foundMaster){
                return res.json({status:"failure",message:`Teacher already found!`});
            }
        }
        try{
            for(const el of data){
                const exists = await Subject.findOne({name: el.subject})
                if(!exists){
                    return res.json({status:"failure",message:`Subject ${el.subject} not found!`});
                }
                if(!exists.grade.some(e=>e==el.grade)){
                    return res.json({status:"failure",message:`The grade ${el.grade} has no subject named: ${el.subject}!`});
                }
            }
            await Teacher.insertMany(data);
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

exports.addStudentManually = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log('Logging...',decrypted)
    const modified = [];
    try{
        decrypted.map((el)=>{
            const temp = {
                name: el.name,
                roll: el.roll,
                dob: el.dob,
                gender: el.gender,
                grade: el.grade,
                email: el.email,
                section: el.section,
                admission_no: el.adno,
                academic_year: el.acyear,
                address: el.address,
                attendance: 0,
            }
            modified.push(temp)
        })
        for(const el of modified){
            console.log(el)
            const exists = await Student.exists({admission_no: el.admission_no, academic_year: el.academic_year})
            console.log(exists)
            if(exists) return res.json({status:"failure", message: "Student Already found!"})
        }
        await Student.insertMany(modified)
        for(const el of modified){
            await Section.updateOne(
                {name: el.section, grade: el.grade},
                {$push: {students: {
                    name: el.name,
                    roll: el.roll,
                    dob: el.dob,
                    gender: el.gender,
                    grade: el.grade,
                    email: el.email,
                    section: el.section,
                    admission_no: el.adno,
                    academic_year: el.acyear,
                    address: el.address,
                    attendance: 0,
                }} }
            )
        }
        return res.json({status:"success"})
    }
    catch(err){
        console.log(err)
        return res.json({status: "failure", message: "Something went wrong!"})
    }
}

exports.addStudentByExcel = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    if(file!==null){
        const workbook = xlsx.readFile(req.file.path)
        const sheet = workbook.SheetNames[0]
        const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(worksheet)
        worksheet.map((el)=>{
            if(!el.hasOwnProperty("Name") || !el.hasOwnProperty("Roll") || !el.hasOwnProperty("DOB") || !el.hasOwnProperty("Gender") || !el.hasOwnProperty("Email") || !el.hasOwnProperty("Grade") || !el.hasOwnProperty("Section") || !el.hasOwnProperty("Admission_No") || !el.hasOwnProperty("Academic_Year") || !el.hasOwnProperty("Address")){
                try{
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Roll, DOB, Gender, Grade, Email, Section, Admission_No, Academic_Year and Address] Properties!`})
                }
                catch(err){
                    return res.json({status:"failure",message:`Excel sheet should contain [Name, Roll, DOB, Gender, Grade, Email, Section, Admission_No, Academic_Year and Address] Properties!`})
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
            const { Name, Roll, DOB, Gender, Grade, Email, Section, Admission_No, Academic_Year, Address } = el;
            let temp = {
                name: Name,
                roll: Roll,
                dob: new Date(DOB),
                gender: Gender,
                grade: Grade,
                email: Email,
                section: Section,
                admission_no: Number(Admission_No),
                academic_year: Academic_Year,
                address: Address,
            };
            data.push(temp);
        });
        console.log('Excel: ',data)
        for(const el of data){
            const exists = await Student.findOne({
                admission_no: el.admission_no,
            });
            if(exists){
                return res.json({status:"failure",message:`Student already found!`});
            }
        }
        for(const el of data){
            const exists = await Student.findOne({
                name: el.name, email: el.email
            });
            if(exists){
                return res.json({status:"failure",message:`Student already found!`});
            }
        }
        for(const el of data){
            const exists = await Student.findOne({roll: el.roll});
            if(exists){
                return res.json({status:"failure",message:`Student already found!`});
            }
        }
        try{
            await Student.insertMany(data);
            for(const el of data){
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
                                email: el.email,
                                section: el.section,
                                admission_no: el.adno,
                                academic_year: el.acyear,
                                address: el.address,
                                attendance: 0,
                            }
                        }
                    }
                )
            }
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

exports.createGradeAdmin = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    const {email,password,grade} = decrypted;
    const exists = await GradeAdmin.exists({email:email})
    if(exists) return res.json({status:"failure",message:"Grade admin already found!"});
    const graded = await GradeAdmin.exists({email:email, grade: grade})
    if(exists) return res.json({status:"failure",message:"Grade admin already found!"});
    try{
        await GradeAdmin.insertOne({email,password,grade})
        return res.json({status:"success", message:"Grade Admin Registered!"});
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure", message:"Something went wrong!"});
    }
}

exports.resetAll = async(req,res) => {
    try{
        await Assignment.deleteMany()
        await Attendance.deleteMany()
        await GradeAdmin.deleteMany()
        await Grade.deleteMany()
        await Logs.deleteMany()
        await Section.deleteMany()
        await Student.deleteMany()
        await Subject.deleteMany()
        await Teacher.deleteMany()
        await Timetable.deleteMany()
        await GradeAdmin.insertOne({
            email: "gdvbca@gmail.com",
            password: "123",
            grade: "4"
        })
        return res.json({status:"success",message:"Everything has RESET!"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure", message:"Something went wrong!"});
    }
}