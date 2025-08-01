import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption'
import StudentChatPanel from '../../Chat/StudentChatPanel'
import StudentTimetable from './StudentTimetable'
import { ValidateStudent } from '../../slices/Login/LoginStudentSlice'
import { useDispatch } from 'react-redux'

const StudentDash = ({socket}) => {
    const location = useLocation()
    const navigate = useNavigate()
    const details = location.state.details || {}
    const [percent,setPercent] = useState(0)
    const [toMail,setToMail] = useState(null)
    console.log(details)

    const dispatch = useDispatch()
    
    useEffect(()=>{
        const doFirst = async() => {
            if(sessionStorage.getItem('token')){
                try{
                    const userDetails = await dispatch(ValidateStudent(sessionStorage.getItem('token'))).unwrap()
                    console.log(userDetails);
                    if(userDetails === "Invalid" || userDetails === "Something went wrong!"){
                        sessionStorage.removeItem('token')
                        alert('Session Expired! Please Login again to continue!')
                        sessionStorage.removeItem('email')
                        sessionStorage.removeItem('token')
                        navigate('/')
                    }
                }
                catch(err){
                    alert('Session Expired! Please Login again to continue!')
                    sessionStorage.removeItem('email')
                    sessionStorage.removeItem('token')
                    navigate('/')
                }
            }
        }
        doFirst()
    },[])

    useEffect(()=>{
        const getAttendance = async () => {
            try{
                const dtls = JSON.stringify({
                    section: details.section,
                    grade: details.grade,
                    year: details.academic_year,
                    roll: details.roll
                })
                const response = await fetch('http://localhost:3000/student/getAttendancePercent',{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({dtls: encryptRandom(dtls)})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    setPercent(data.percentage)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
                alert('Something went wrong!')
            }
        }
        const getStaffEmail = async () => {
            const response = await fetch('http://localhost:3000/student/getStaffEmail',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({details:{section:details.section,grade:details.grade}})
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success'){
                setToMail(data.toMail)
            }
            else{
                alert(data.message)
            }
        }
        getAttendance()
        getStaffEmail()
    },[])
    
    return (
        <div className='entry' style={{flexDirection:"column", background: '#333', position: 'fixed'}}>
            <h1 className='student-h1'>Welcome, {details.name}
                <h4 style={{fontSize:"12px",color:"#aaa",position:"absolute",right:"1vw"}}>Email: {details.email}</h4>
            </h1>
            <div className='student-dash-side'>
            <div className='student-top'>
                <h4 style={{color:"#666"}}>Attendance: <br/>
                <div style={{width: "150px", border: "1px solid grey", height: "10px",display:"flex",justifyContent:"end", background:"linear-gradient(to right, orangered, lime)"}}><div style={{width:`${100-percent}%`,height:"100%",background: "white"}}></div></div>{percent ? percent: 0}%</h4>
            </div>
                <h2 className='student-h2'>Grade: {details.grade}</h2>
                <h3 className='student-h3'>Section: {details.section}</h3>
                <h4 className='student-h4'>{details.academic_year}</h4>
                <h4 className='student-h4'>Roll: {details.roll}</h4>
                <button style={{boxShadow: 'none'}} onClick={()=>navigate('/assignments-student',{state:{details:details}})}>Assignments</button>
            </div>
            
            <h4 className='student-h4' style={{borderRadius:"0px",userSelect:"none",position:"absolute",left:"16vw",top: '10vh',boxShadow:"none"}}>Timetable: </h4>
            {
                (toMail && socket) &&
                <StudentChatPanel socket={socket} gradeFromLogin={details.grade} sectionFromLogin={details.section} toMail={toMail}/>
            }
            <StudentTimetable details={details}/>
        </div>
    )
}

export default StudentDash