import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { decryptRandom, encryptRandom } from '../../Security/Encryption'
import TeacherTimetable from './TeacherTimetable'
import StaffChatPanel from '../../Chat/StaffChatPanel'
import { ChatContext } from '../../Context/ChatContext'

const TeacherDash = ({socket}) => {
    const navigate = useNavigate()
    const [staffDetails,setStaffDetails] = useState({})
    const storedEmail = sessionStorage.getItem('email') || null;
    const {setSocketConn} = useContext(ChatContext)

    useEffect(()=>{
        setSocketConn(socket)
    },[socket])

    useEffect(()=>{
        const getStaffInfo = async () => {
            try{
                const response = await fetch('http://localhost:3000/staff/getStaffInfo',{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({emailID:encryptRandom(storedEmail)})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    const decryptedDetails = JSON.parse(decryptRandom(data.staffDetails))
                    console.log(decryptedDetails)
                    setStaffDetails(decryptedDetails)
                }
                else{
                    alert(data.message)
                    return;
                }
            }
            catch(err){
                console.log(err)
                return;
            }
        }
        if(storedEmail !== null)
            getStaffInfo()
    },[])

    useEffect(()=>{
        console.log(staffDetails)
    },[staffDetails])

    const handleAttendanceClick = async() => {
        const details = JSON.stringify({
            name: staffDetails.name,
            grade: staffDetails.grade,
            section: staffDetails.section,
        })
        try{
            const response = await fetch('http://localhost:3000/staff/getStudentList',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({details:encryptRandom(details)}),
            })
            const data = await response.json()
            console.log(data.list)
            if(data.status==='success'){
                navigate('/attendance',{state: {staff: staffDetails,studentList: data.list}})
            }
            else{
                alert('Wait! Retry sometime later!')
                return;
            }
        }
        catch(err){
            console.log(err)
            alert("Something went wrong!")
            return;
        }
    }

    const handleAssignmentClick = () => {
        navigate('/post-assignment',{state: staffDetails})
    }

    return (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',overflow:'auto',scrollBehavior:'smooth'}}>
            <div className='nav-note'>
                <span className='welcome-note'>Welcome, Teacher</span>
                <div>
                    <button style={{background: 'black', color: 'white'}} onClick={handleAttendanceClick}>Mark Attendance</button>
                    <button onClick={handleAssignmentClick}>Post Assignment</button>
                </div>
            </div>
            <div>
                {
                    staffDetails.hasOwnProperty("email") &&
                    <TeacherTimetable details={{gradeId:staffDetails.grade,sectionId:staffDetails.section,academicYear:"2025-00-00",name: staffDetails.name, subject: staffDetails.subject}}/>
                }
                {staffDetails.hasOwnProperty('grade') && <StaffChatPanel socket={socket} gradeFromLogin={staffDetails.grade} sectionFromLogin={staffDetails.section} myMail={staffDetails.email}/>}
            </div>
        </div>
    )
}

export default TeacherDash