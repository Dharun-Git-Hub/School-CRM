const WebSocket = require('ws')
const {v4:uuid} = require('uuid')
const { Component } = require('react')
const PORT = 8000

const clients = new Map()                   // WS -> ID
const namedClients = new Map()              // ID -> Name
const rooms = new Map()                     // Room_Name -> Room_Properties

const wss = new WebSocket.Server({port:PORT})

const enc = (msg) => {
    return JSON.stringify(msg)
}

const showAll = () => {
    console.log('Named Clients')
    console.log(namedClients)
}

// Helper Functions

const sendGradeAdminsNameToSuper = () => {
    const gradeAdmins = rooms.get('superRoom').people;
    let gradeAdminsName = [];
    for (let i of gradeAdmins) {
        if (i.hasOwnProperty('grade')) {
            for (let name of i["grade"]) {
                gradeAdminsName.push(namedClients.get(name));
            }
        }
    }
    return gradeAdminsName;
};

const sendStaffNamesToGradeAdmin = (grade) => {
    const staff = rooms.get(`gradeRoom_${grade}`).people;
    let staffNames = [];
    for (let i of staff) {
        if (i.hasOwnProperty('staff')) {
            for (let name of i["staff"]) {
                staffNames.push(namedClients.get(name));
            }
        }
    }
    return staffNames;
};


const sendGradeAdminNameToStaff = (grade) => {
    const gradeRoom = rooms.get(`gradeRoom_${grade}`).people;
    for (let i of gradeRoom) {
        if (i.hasOwnProperty('gradeAdmin')) {
            return namedClients.get(i["gradeAdmin"]);
        }
    }
    return null;
};


const sendStaffNameToStudent = (grade, section) => {
    const room = rooms.get(`studentRoom_${grade}_${section}`).people;
    for (let i of room) {
        if (i.hasOwnProperty('staff')) {
            return namedClients.get(i["staff"]);
        }
    }
    return null;
};


const sendStudentsNameToStaff = (grade, section) => {
    const studentRoom = rooms.get(`studentRoom_${grade}_${section}`).people;
    let studentNames = [];
    for (let i of studentRoom) {
        if (i.hasOwnProperty("students")) {
            for (let name of i['students']) {
                studentNames.push(namedClients.get(name));
            }
        }
    }
    return studentNames;
};

// ______________________________________________________________________________________________

wss.on('connection',(ws)=>{
    const userId = uuid()
    ws.send(enc({type:"your_id",id:userId}))
    ws.room = null;
    clients.set(ws,userId)
    ws.on('message',(message)=>{
        let data;
        try{
            data = JSON.parse(message)
        }
        catch(err){
            ws.send(enc({type:"type_error",message:"Please send JSON Format"}))
        }
        const msg = data.message
        if(data.type==='my_name'){
            const isNameTaken = Array.from(namedClients.values()).includes(data.name);
            if(isNameTaken){
                ws.send(enc({type: "name_error", message: `Name '${data.name}' is already taken. Please choose another.`}));
                return;
            }
            clients.set(ws,userId)
            namedClients.set(userId,data.name)
            if(data.position==='super'){
                if(!rooms.has('superRoom')){
                    rooms.set('superRoom',{
                        people: [{"super":null},{"grade":[]}],
                    })
                }
                for(let i of rooms.get('superRoom').people){
                    if(i.hasOwnProperty("super")){
                        if(i["super"]===null)
                            i["super"]=userId;
                        else{
                            namedClients.delete(i["super"]);
                            i["super"]=null;
                            i["super"]=userId;
                        }
                    }
                }
                console.log(`Super admin with ID: ${userId} has joined Super-Grade Room`)
                console.log(rooms.get('superRoom').people)
                
            }
            else if(data.position === 'grade'){
                console.log(data)
                const myGrade = data.grade;
                console.log('MyGrade',myGrade)
                if(!rooms.has('superRoom')){
                    rooms.set('superRoom',{
                        people: [{"super":null},{"grade":[]}],
                    })
                }
                for(let i of rooms.get('superRoom').people){
                    if(i.hasOwnProperty("grade")){
                        if(!i["grade"].includes(userId))
                            i["grade"].push(userId)
                    }
                }
                console.log(`Grade admin with ID: ${userId} has joined Super-Grade Room at the gradeRoom_${myGrade}`)
                console.log('Super - Grade Room: ')
                console.log(rooms.get('superRoom').people)
                if(!rooms.has(`gradeRoom_${myGrade}`)){
                    rooms.set(`gradeRoom_${myGrade}`,{
                        people: [{"gradeAdmin":null},{"staff":[]}],
                    })
                }
                for(let i of rooms.get(`gradeRoom_${myGrade}`).people){
                    if(i.hasOwnProperty("gradeAdmin")){
                        if(i["gradeAdmin"]===null){
                            i["gradeAdmin"]=userId;
                        }
                        else{
                            i["gradeAdmin"]=null;
                            i["gradeAdmin"]=userId;
                        }
                    }
                }
                console.log(`Grade admin with ID: ${userId} has joined Grade-Staff Room`)
                console.log('Grade - Staff Room: , Grade: ',myGrade)
                console.log(rooms.get(`gradeRoom_${myGrade}`).people)
                const gradeAdminsNames = sendGradeAdminsNameToSuper();
                console.log('Grade Admin Names: ',gradeAdminsNames)
                for(let i of rooms.get('superRoom').people){
                    if(i.hasOwnProperty('super')){
                        for(let [conn,ids] of clients.entries()){
                            if(ids===i['super']){
                                conn.send(enc({
                                    type: 'grade_admins_list',
                                    list: gradeAdminsNames
                                }));
                            }
                        }
                    }
                }
            }
            else if(data.position==='staff'){
                const myGrade = data.grade;
                const mySection = data.section;
                console.log(data)
                console.log('MyGrade',myGrade)
                console.log('MySection',mySection)
                if(!rooms.has(`gradeRoom_${myGrade}`)){
                    rooms.set(`gradeRoom_${myGrade}`,{
                        people: [{"gradeAdmin":null},{"staff":[]}],
                    })
                }
                for(let i of rooms.get(`gradeRoom_${myGrade}`).people){
                    if(i.hasOwnProperty("staff")){
                        if(!i["staff"].includes(userId))
                            i["staff"].push(userId)
                    }
                }
                console.log(`Staff with ID: ${userId} has joined Grade-Staff Room`)
                console.log('Grade - Staff Room: ')
                console.log(rooms.get(`gradeRoom_${myGrade}`).people)
                if(!rooms.has(`studentRoom_${myGrade}_${mySection}`)){
                    rooms.set(`studentRoom_${myGrade}_${mySection}`,{
                        people: [{"staff":null},{"students":[]}],
                    })
                }
                for(let i of rooms.get(`studentRoom_${myGrade}_${mySection}`).people){
                    if(i.hasOwnProperty("staff")){
                        if(i["staff"]===null){
                            i["staff"]=userId;
                        }
                        else{
                            namedClients.delete(i["staff"]);
                            i["staff"]=null;
                            i["staff"]=userId;
                        }
                    }
                }
                console.log(`Staff with ID: ${userId} has joined Staff-Student Room`)
                console.log('Staff - Student Room: , Grade: ',myGrade)
                console.log(`Section: `,mySection)
                console.log(rooms.get(`studentRoom_${myGrade}_${mySection}`).people)
                const gradeAdminsNames = sendStaffNamesToGradeAdmin(myGrade);
                console.log(`Staff of grade: ${myGrade}'s names`,gradeAdminsNames)
                for(let i of rooms.get(`gradeRoom_${myGrade}`).people){
                    if(i.hasOwnProperty('gradeAdmin')){
                        for(let [conn,ids] of clients.entries()){
                            if(ids===i['gradeAdmin']){
                                conn.send(enc({
                                    type: 'grade_admins_list',
                                    list: gradeAdminsNames
                                }));
                            }
                        }
                    }
                }
            }
            else if(data.position==='student'){
                const myGrade = data.grade;
                const mySection = data.section;
                if(!rooms.has(`studentRoom_${myGrade}_${mySection}`)){
                    rooms.set(`studentRoom_${myGrade}_${mySection}`,{
                        people: [{"staff":null},{"students":[]}],
                    })
                }
                for(let i of rooms.get(`studentRoom_${myGrade}_${mySection}`).people){
                    if(i.hasOwnProperty("students")){
                        if(!i["students"].includes(userId))
                            i["students"].push(userId)
                    }
                }
                console.log(`Student with ID: ${userId} has joined Staff-Student Room`)
                console.log('Staff - Student Room: ')
                console.log(rooms.get(`studentRoom_${myGrade}_${mySection}`).people)
            }
        }
        else if(data.type==='public_msg_to_gradeAdmins'){
            for(let i of rooms.get('superRoom').people){
                if(i.hasOwnProperty("grade")){
                    for(let id of i["grade"]){
                        for(let [conn,ids] of clients.entries()){
                            if(ids===id){
                                conn.send(enc({type:"public_message_from_super",message:msg}))
                            }
                        }
                    }
                }
            }
        }
        else if(data.type==='public_msg_to_staff'){
            const myGrade = data.grade;
            for(let i of rooms.get(`gradeRoom_${myGrade}`).people){
                if(i.hasOwnProperty("staff")){
                    for(let id of i["staff"]){
                        for(let [conn,ids] of clients.entries()){
                            if(ids===id){
                                conn.send(enc({type:"public_message_from_grade",message:msg}))
                            }
                        }
                    }
                }
            }
        }
        else if(data.type==='public_msg_to_students'){
            const myGrade = data.grade;
            const mySection = data.section;
            for(let i of rooms.get(`studentRoom_${myGrade}_${mySection}`).people){
                if(i.hasOwnProperty("students")){
                    for(let id of i["students"]){
                        for(let [conn,ids] of clients.entries()){
                            if(ids===id){
                                conn.send(enc({type:"public_message_from_staff",message:msg}))
                            }
                        }
                    }
                }
            }
        }
        else if(data.type==='private_msg_to_student'){
            const myGrade = data.grade;
            const mySection = data.section;
            const studentName = data.toName;
            let toId;
            for(let [id,name] of namedClients.entries()){
                if(name===studentName){
                    toId = id;
                }
            }
            for(let i of rooms.get(`studentRoom_${myGrade}_${mySection}`).people){
                if(i.hasOwnProperty("students")){
                    for(let id of i["students"]){
                        if(id===toId){
                            for(let [conn,ids] of clients.entries()){
                                if(ids===toId)
                                    conn.send(enc({type:"private_message_from_staff",message:msg}))
                            }
                        }
                    }
                }
            }
        }
        else if(data.type==='private_msg_to_gradeAdmin'){
            const auth = data.auth;
            const toName = data.to;
            let toId;
            for(let [id,name] of namedClients.entries()){
                if(name===toName){
                    toId = id;
                }
            }
            for(let i of rooms.get('superRoom').people){
                if(i.hasOwnProperty("grade")){
                    for(let id of i["grade"]){
                        if(id===toId){
                            for(let [conn,ids] of clients.entries()){
                                if(ids===id){
                                    conn.send(enc({type:`private_message_from_${auth==='super'?'super':'staff'}`,from: data.mail,message:msg}))
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        else if(data.type==='private_msg_to_super'){
            const myGrade = data.grade;
            let toId;
            for(let i of rooms.get('superRoom').people){
                if(i.hasOwnProperty('super')){
                    toId = i["super"]
                    break;
                }
            }
            for(let [conn,ids] of clients.entries()){
                if(ids===toId){
                    conn.send(enc({type:"private_message_from_grade",from: myGrade,message:msg}));
                    break;
                }
            }
        }
        else if(data.type === 'get_grade_admins_list'){
            const gradeAdminsNames = sendGradeAdminsNameToSuper();
            console.log('Grade Admin Names: ',gradeAdminsNames)
            ws.send(enc({
                type: 'grade_admins_list',
                list: gradeAdminsNames
            }));
        }
        else if(data.type === 'get_staff_list'){
            const grade = data.grade;
            let staffList = [];
            if (rooms.has(`gradeRoom_${grade}`)) {
                staffList = sendStaffNamesToGradeAdmin(grade);
            }
            ws.send(enc({
                type: 'staff_list',
                list: staffList
            }));
        }
        else if(data.type === 'get_students_list'){
            const {grade, section} = data;
            const students = sendStudentsNameToStaff(grade, section);
            ws.send(JSON.stringify({
                type: 'students_list',
                list: students
            }));
        }
        else if(data.type==='private_msg_to_staff'){
            const auth = data.auth;
            const myGrade = data.grade;
            const staffName = data.to;
            let toId;
            if (rooms.has(`gradeRoom_${myGrade}`)) {
                for (let i of rooms.get(`gradeRoom_${myGrade}`).people) {
                    if (i.hasOwnProperty('staff')) {
                        for (let id of i['staff']) {
                            if (namedClients.get(id) === staffName) {
                                toId = id;
                                break;
                            }
                        }
                    }
                }
            }
            if(toId){
                for(let [conn,ids] of clients.entries()){
                    if(ids === toId){
                        let fromName = null;
                        for(let [id,name] of namedClients.entries()){
                            if(id===clients.get(ws))
                                fromName = name;
                        }
                        conn.send(enc({type:'private_message_from_grade', message: msg, from: fromName }));
                        break;
                    }
                }
            }
        }
        showAll()
        console.log('All the Rooms: ')
        for(let [name,props] of rooms.entries()){
            console.log(rooms.get(name))
        }
    })

    ws.on('close', () => {
        const userId = clients.get(ws);
        clients.delete(ws);
        namedClients.delete(userId);

        for(let [roomName,roomData] of rooms.entries()){
            const peopleArray = roomData.people;

            for(let i = 0; i < peopleArray.length; i++){
                const roleBlock = peopleArray[i];
                const role = Object.keys(roleBlock)[0];
                if(Array.isArray(roleBlock[role])){
                    const index = roleBlock[role].indexOf(userId);
                    if(index !== -1){
                        roleBlock[role].splice(index, 1);
                    }
                }
                else{
                    if(roleBlock[role] === userId){
                        roleBlock[role] = null;
                    }
                }
            }
        }
        console.log(`Client with ID ${userId} disconnected.`);
        showAll();
    });

})

console.log(`WebSocket Initiated @Port: ${PORT}`)