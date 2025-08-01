const WebSocket = require('ws')
const {v4:uuid} = require('uuid')
const PORT = 8000

const clients = require('../Helpers/Chat_Helpers.cjs').clients
const namedClients = require('../Helpers/Chat_Helpers.cjs').namedClients
const rooms = require('../Helpers/Chat_Helpers.cjs').rooms
const enc = require('../Helpers/Chat_Helpers.cjs').enc
const sendGradeAdminsNameToSuper = require('../Helpers/Chat_Helpers.cjs').sendGradeAdminsNameToSuper
const sendStaffNamesToGradeAdmin = require('../Helpers/Chat_Helpers.cjs').sendStaffNamesToGradeAdmin
const sendStudentsNameToStaff = require('../Helpers/Chat_Helpers.cjs').sendStudentsNameToStaff

const wss = new WebSocket.Server({port:PORT})

const showAll = () => {
    console.log('Named Clients')
    console.log(namedClients)
}

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
                const studentsNames = sendStudentsNameToStaff(myGrade,mySection);
                for(let i of rooms.get(`studentRoom_${myGrade}_${mySection}`).people){
                    if(i.hasOwnProperty('staff')){
                        for(let [conn,ids] of clients.entries()){
                            if(ids===i['staff']){
                                conn.send(enc({
                                    type: 'students_list',
                                    list: studentsNames
                                }))
                            }
                        }
                    }
                }
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
            console.log(`Staff of Grade : ${myGrade} - ${mySection} has send a message to ${studentName}`)
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
            ws.send(enc({
                type: 'students_list',
                list: students
            }));
        }
        else if(data.type==='private_msg_to_staff'){
            const auth = data.auth;
            const myGrade = data.grade;
            const mySection = data.section;
            const staffName = data.to;
            let toId;
            console.log(data)
            if(auth==='grade'){
                if(rooms.has(`gradeRoom_${myGrade}`)){
                    for(let i of rooms.get(`gradeRoom_${myGrade}`).people){
                        if(i.hasOwnProperty('staff')){
                            for(let id of i['staff']){
                                if(namedClients.get(id)===staffName){
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
            else if(auth==='student'){
                if(rooms.has(`studentRoom_${myGrade}_${mySection}`)){
                    for(let i of rooms.get(`studentRoom_${myGrade}_${mySection}`).people){
                        if(i.hasOwnProperty('staff')){
                            console.log(i['staff'])
                            for(let [ids,names] of namedClients.entries()){
                                if(ids===i['staff']){
                                    toId=names
                                }
                            }
                        }
                    }
                }
                console.log('TOID: ',toId)
                if(toId){
                    for(let [ids,names] of namedClients.entries()){
                        if(names===toId){
                            for(let [conn,id] of clients.entries()){
                                if(id===ids){
                                    conn.send(enc({type:'private_message_from_student', message: msg, from: namedClients.get(userId) }));
                                }
                            }
                        }
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