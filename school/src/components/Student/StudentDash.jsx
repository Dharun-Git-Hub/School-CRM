import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption'

const StudentDash = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const details = location.state.details || {}
    const [percent,setPercent] = useState(0)
    console.log(details)

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
        getAttendance()
    },[])
    
    return (
        <div>
            <h1>Welcome, {details.name}</h1>
            <h2>Grade: {details.grade}</h2>
            <h3>Section: {details.section}</h3>
            <h4>{details.academic_year}</h4>
            <h4>Roll: {details.roll}</h4>
            <h4>Attendance: {percent ? percent: 0}%</h4>
            <button onClick={()=>navigate('/assignments-student',{state:{details:details}})}>Assignments</button>
        </div>
    )
}

export default StudentDash