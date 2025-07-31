const clients = new Map()                   // WS -> ID
const namedClients = new Map()              // ID -> Name
const rooms = new Map()      

const sendGradeAdminsNameToSuper = () => {
    const gradeAdmins = rooms.get('superRoom').people;
    let gradeAdminsName = [];
    for(let i of gradeAdmins) {
        if(i.hasOwnProperty('grade')){
            for(let name of i["grade"]){
                gradeAdminsName.push(namedClients.get(name));
            }
        }
    }
    return gradeAdminsName;
};

const sendStaffNamesToGradeAdmin = (grade) => {
    const staff = rooms.get(`gradeRoom_${grade}`).people;
    let staffNames = [];
    for(let i of staff){
        if(i.hasOwnProperty('staff')){
            for(let name of i["staff"]){
                staffNames.push(namedClients.get(name));
            }
        }
    }
    return staffNames;
};

const sendStudentsNameToStaff = (grade,section) => {
    const student = rooms.get(`studentRoom_${grade}_${section}`).people
    let studentNames = [];
    for(let i of student){
        if(i.hasOwnProperty('students')){
            for(let name of i['students']){
                studentNames.push(namedClients.get(name));
            }
        }
    }
    console.log(`The Students of ${grade} - ${section} is : ${studentNames}`)
    return studentNames;
}

const enc = (msg) => {
    return JSON.stringify(msg)
}

module.exports = {
    sendGradeAdminsNameToSuper,
    sendStaffNamesToGradeAdmin,
    sendStudentsNameToStaff,
    enc,
    clients,
    namedClients,
    rooms
}