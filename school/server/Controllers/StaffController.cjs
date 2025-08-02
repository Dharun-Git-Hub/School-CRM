const Student = require('../Schemas/Student/StudentSchema.cjs');
const TeacherModel = require('../Schemas/Teacher/TeacherSchema.cjs')
const Timetable = require('../Schemas/TimeTable/TimeTableSchema.cjs')
const GradeAdmin = require('../Schemas/GradeAdmin/GradeAdminLoginSchema.cjs')
const Subject = require('../Schemas/Subject/SubjectSchema.cjs')
const Section = require('../Schemas/Section/SectionSchema.cjs')
const Assignment = require('../Schemas/Assignment/AssignmentSchema.cjs')
const { decryptRandom, encryptRandom } = require('../Helpers/Cryptors.cjs');
const jwt = require('jsonwebtoken');
const fs = require('fs')
const { sendForgotLink, generateID } = require('../Helpers/SendEmail.cjs');
const Attendance = require('../Schemas/Attendance/AttendanceSchema.cjs')
const Logs = require('../Schemas/Logs/LogSchema.cjs')
const jwtsecret = 'jwtsecret'

exports.login = async(req,res) => {
    const {details} = req.body;
    console.log(details);
    const decrypted = JSON.parse(decryptRandom(details));
    console.log('Decrypted: ',decrypted)
    const exists = await TeacherModel.exists({email:decrypted.email, password: decrypted.password})
    if(!exists)
        return res.json({status:"failure",message: "Invalid Email or Password!"});
    const token = jwt.sign({email:decrypted.email},jwtsecret,{expiresIn: "50m"})
    await Logs.insertOne({action:`Staff with email: ${decrypted.email} logged in !`,who: `Staff with MailID: ${decrypted.email}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
    return res.json({status:"success",token:token})
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

const idStore = new Map()

exports.sendLink = async (req,res) => {
    const {email} = req.body;
    const decrypted = JSON.parse(decryptRandom(email));
    console.log(decrypted)
    const exists = await TeacherModel.exists({email:decrypted.email})
    console.log(exists)
    if(!exists) return res.json({status:"failure",message:"Invalid Registered Email!"})
    const id = generateID()
    idStore.set(decrypted.email,id);
    console.log(idStore)
    try{
        sendForgotLink(encryptRandom(decrypted.email),encryptRandom(id),"staff-link");
        await Logs.insertOne({action:`Staff with email: ${decrypted.email} requested to change password`,who: `Staff with MailID: ${decrypted.email}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
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
        await TeacherModel.updateOne({email: decrypted.email},{$set:{password:decrypted.newpassword}})
        await Logs.insertOne({action:`Staff with email: ${decrypted.email} just changed his password as ${decrypted.newpassword} !`,who: `Staff with MailID: ${decrypted.email}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
        return res.json({status:"success"})
    }
    catch(err){
        idStore.delete(decryptRandom(decrypted.email))
        return res.json({status:"failure"})
    }
}

exports.getTimeline = async (req,res) => {
    const {details} = req.body
    const {gradeId} = JSON.parse(decryptRandom(details))
    console.log('Section: ',gradeId)
    try{
        const result = await Timetable.find({gradeID: gradeId})
        return res.json({status:"success",list:result})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getStaffInfo = async (req,res) => {
    const {emailID} = req.body;
    const mailID = decryptRandom(emailID);
    console.log(mailID)
    try{
        const exists = await TeacherModel.findOne({email:mailID})
        if(!exists)
                return res.json({status:"failure",message:"Non Registered Teacher!"})
        return res.json({status:"success",staffDetails:encryptRandom(JSON.stringify(exists))})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getStudentList = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    try{
        const exists = await TeacherModel.findOne({name: decrypted.name,grade: decrypted.grade, section: decrypted.section})
        if(!exists) return res.json({status:"failure",message:"Please assign a class first!"})
        const sectionExists = await Section.findOne({name: decrypted.section, grade: decrypted.grade})
        if(!sectionExists) return res.json({status:"failure",message:"Create that section before adding!"})
        const sorted = sectionExists.students.sort((a,b)=>a.name-b.name)
        console.log(sorted);
        return res.json({status:"success",list:sectionExists.students})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.markAttendance = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    const {section,grade,year,month,day,students,name} = decrypted;
    try{
        const exists = await TeacherModel.exists({name:name,section:section,grade:grade})
        if(!exists)
            return res.json({status:"failure",message:"Unauthorized Access!"})
        if(new Date(year,month-1,day).toLocaleDateString() === new Date().toLocaleDateString()){
            const marked = await Attendance.exists({section,grade,year,month,day})
            console.log(marked);
            if(marked){
                await Attendance.updateOne(
                    { section,grade,year,month,day },
                    { $set: { students } }
                )
                await Logs.insertOne({action:`Staff with name: ${name} just updated attendance for grade: ${grade}, section: ${section} for Date: ${day}-${month}-${year}`,who: `Staff with name: ${name}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
                return res.json({status:"success",message:"Attendance Marked!"})
            }
            else{
                await Logs.insertOne({action:`Staff with name: ${name} just marked attendance for grade: ${grade}, section: ${section} for Date: ${day}-${month}-${year}`,who: `Staff with name: ${name}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
                await Attendance.insertOne(decrypted);
                return res.json({status:"success",message:"Attendance Marked!"})
            }
        }
        else{
            return res.json({status:"failure", message:`Mark attendance for present date only! (${new Date().toLocaleDateString()})`})
        }
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getAttendance = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    const {section,grade,year,month,name} = decrypted
    try{
        const exists = await TeacherModel.exists({name:name,section:section,grade:grade})
        if(!exists)
            return res.json({status:"failure",message:"Unauthorized Access!"})
        const result = await Attendance.find({section,grade,year,month})
        console.log('Attendance', result)
        return res.json({status:"success",list:encryptRandom(JSON.stringify(result))})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getAssignments = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    try{
        const exists = await Assignment.find({teacher:decrypted.teacher,grade:decrypted.grade,subject:decrypted.subject})
        console.log(exists)
        return res.json({status:"success",list:exists});
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.postAssignment = async (req,res) => {
    const file = req.file && req.file.path ? fs.readFileSync(req.file.path) : null;
    const title = req.body.title;
    const description = req.body.description;
    const teacher = req.body.teacher;
    const subject = req.body.subject;
    const section = req.body.section;
    const grade = req.body.grade;
    const total = req.body.total;
    const details = {
        title,
        description,
        teacher,
        grade,
        subject,
        section,
        total,
        date: new Date().toLocaleDateString(),
        attachments: file,
    }
    console.log(details)
    try{
        await Assignment.insertOne(details);
        await Logs.insertOne({action:`Staff with name: ${teacher} just posted an Assignment for grade: ${grade}, section: ${section} for Date: ${new Date().toLocaleDateString()}`,who: `Staff with name: ${teacher}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
        return res.json({status:"success",message:"Assignment posted succesfully!"});
    }
    catch(err){
        console.log(err)
        return res.json({statsu:"failure",message:"Something went wrong!"})
    }
}

exports.deleteAssignment =async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    try{
        const exists = await Assignment.exists({title:decrypted.title,date:decrypted.date})
        if(!exists){
            return res.json({status:"failure",message:"The Assignment not found!"})
        }
        await Assignment.deleteOne({title:decrypted.title,date:decrypted.date.toString()})
        await Logs.insertOne({action:`Staff with name: ${decrypted.teacher} just deleted an Assignment for grade: ${decrypted.grade}, section: ${decrypted.section} for Date: ${new Date().toLocaleDateString()}`,who: `Staff with name: ${decrypted.teacher}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
        return res.json({status:"success",message:"Assignment deleted successfully!"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getMyGrades = async(req,res) => {
    const {details} = req.body;
    const {staffName,staffGrade} = JSON.parse(decryptRandom(details))
    console.log(JSON.parse(decryptRandom(details)))
    try{
        const pipeline = [
            {
                $project:{
                    _id: 0,
                }
            },
            {
                $match: { 
                    $and: [
                        {"timeslots.teacher":staffName},
                        {"gradeID":staffGrade}
                    ]
                } 
            },
            {
                $project: {
                    _id: 0,
                    gradeID: 1,
                    sectionID: 1,
                    "timeslots.teacher": 1,
                }
            },
            {
                $group: {
                    _id: "$sectionID",
                }
            },
            {
                $project: {
                    _id: 0,
                    sections: "$_id",
                }
            },
        ]
        const result = await Timetable.aggregate(pipeline)
        console.log('Result: ',result)
        const sections = result.reduce((acc,c)=>{
            acc.push(c.sections)
            return acc;
        },[])
        return res.json({status:"success",list:sections})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getRemaining = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    const {grade,subject,section,teacher,date,title} = decrypted
    const students = await Student.find({
        grade: grade,
        section: section,
    })
    console.log('Total Students: ')
    const totalStudents = []
    const incomplete = []
    students.map((el)=>{
        totalStudents.push({name: el.name, roll: el.roll})
    })
    console.log('Decrypted: ',decrypted)
    const finished = await Assignment.find({
        title,teacher,grade,subject,section,date
    })
    console.log('Total: ',totalStudents)
    for(const i of finished){
        for(const j of i.submissions){
            incomplete.push({name: j.student,roll: j.roll})
        }
    }
    const remaining = []
    for(const i of totalStudents){
        const a = incomplete.some(el=>el.name === i.name)
        if(!a){
            remaining.push(i)
        }
    }
    return res.json({
        status: "success",
        list: {total:totalStudents,incomplete:remaining}
    })
}

exports.assignMarks = async (req,res) => {
    const {details} = req.body;
    const decrypted = JSON.parse(decryptRandom(details))
    console.log(decrypted)
    const {teacher,grade,subject,section,title,date,gained} = decrypted
    try{
        const exists = await Assignment.exists({teacher,grade,subject,section,title,date});
        if(!exists){
            return res.json({status:"failure",message:"No such assignment found!"})
        }
        for(const el of Object.values(gained)){
            const updated = await Assignment.updateOne(
                {
                    teacher,grade,subject,section,title,date,
                    "submissions.student":el.name,
                    "submissions.roll":el.roll,
                },
                {
                    $set: {
                        "submissions.$.marks": el.gained,
                        "submissions.$.feedback": el.feedback
                    }
                }
            )
            console.log(updated)
        }
        await Logs.insertOne({action:`Staff with name: ${teacher} just assigned marks for students of grade: ${grade}, section: ${section} for Date: ${new Date().toLocaleDateString()}\nSubject: ${subject}, Title: ${title}`,who: `Staff with name: ${teacher}`,time: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,to:["Super","Grade"]})
        return res.json({status:"success",message:"Marks and Feedbacks are scored successfully!"})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.loadStudentNames = async (req,res) => {
    const {details} = req.body;
    console.log('My Details: ',details)
    try{
        const result = await Student.find({grade:details.grade,section:details.section})
        const list = []
        for(let i of result){
            list.push({email:i.email,roll:i.roll})
        }
        return res.json({status:'success',list})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.loadGradeName = async (req,res) => {
    const {details} = req.body;
    try{
        console.log('This Details: ',details)
        const result = await GradeAdmin.findOne({grade:details.gradeFromLogin})
        console.log(result)
        return res.json({status:"success",list:result?.email})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:"Something went wrong!"})
    }
}

exports.getOverview = async (req,res) => {
    try{
        const {grade,section} = req.body;
        const students = await Student.find({grade,section})
        const subjects = await Subject.find({grade:{$in:grade}})
        const sections = await Section.find({grade,name: section})
        return res.json({status:'success',list:{students,subjects,sections}})
    }
    catch(err){
        console.log(err)
        return res.json({status:"failure",message:'Something went wrong'})
    }
}