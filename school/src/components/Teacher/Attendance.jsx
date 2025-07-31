import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { decryptRandom, encryptRandom } from '../../Security/Encryption'
import { ChatContext } from '../../Context/ChatContext'
import StaffChatPanel from '../../Chat/StaffChatPanel'

const Attendance = () => {
    const location = useLocation()
    const details = location.state || {}
    const navigate = useNavigate()
    console.log(details)

    const today = new Date()

    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
    const [currentDate, setCurrentDate] = useState(today.getDate())
    const [totalDays, setTotalDays] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
    const [days, setDays] = useState([])
    const [sundays, setSundays] = useState([])
    const [present, setPresent] = useState([])
    const [history, setHistory] = useState([])
    const [past,setPast] = useState([])
    const {socketConn} = useContext(ChatContext)

    useEffect(() => {
        const getAttendanceData = async () => {
            try{
                const dtls = {
                    section: details.staff.section,
                    grade: details.staff.grade,
                    year: currentYear,
                    month: currentMonth,
                    day: currentDate,
                    name: details.staff.name,
                }
                const response = await fetch('http://localhost:3000/staff/getAttendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ details: encryptRandom(JSON.stringify(dtls)) })
                })
                const data = await response.json()
                console.log(JSON.parse(decryptRandom(data.list)))
                if(data.status === 'success'){
                    setHistory(JSON.parse(decryptRandom(data.list)))
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.error(err)
                alert('Something went wrong!')
            }
        }
        getAttendanceData()
    }, [currentMonth])

    useEffect(()=>{
        const temp = []
        const pastTemp = []
        for(let i of history){
            if(i.day==currentDate){
                for(let j of i.students){
                    temp.push(j)
                }
            }
        }
        console.log(temp)
        if(temp.length>0){
            setPresent(prev=>[...prev,...temp])
        }
        for(let i of history){
            if(i.day!=currentDate){
                pastTemp.push({[i.day]:i.students})
            }
        }
        console.log(pastTemp)
        setPast(pastTemp)
    },[history])

    useEffect(()=>{
        console.log(present)
    },[present])

    useEffect(()=>{
        const newDays = Array.from({ length: totalDays }, (_, i) => i + 1)
        setDays(newDays)
        setSundays(getSundays(currentYear, currentMonth))
    },[currentMonth, totalDays])

    const getSundays = (year, month) => {
        const sundays = []
        const daysInMonth = new Date(year, month, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day)
            if (date.getDay() === 0 || date.getDay() === 6) {
                sundays.push(day)
            }
        }
        return sundays
    }

    const isSameDate = (d1, d2) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        )
    }

    const isDateLocked = (year, month, day) => {
        const selected = new Date(year, month - 1, day)
        if(selected.getDay() === 0 || selected.getDay() === 6)
            return true
        if(selected > today)
            return true
        if(!isSameDate(selected, today))
            return true
        return false
    }

    const isPresent = (day, roll) => {
        console.log(roll)
        console.log(day)
        for(let i of history){
            if(i.day == day){
                return i.students.includes(roll)
            }
        }
        return false;
    };

    const isPast = (day,roll) => {
        for(let i of past){
            if(i.hasOwnProperty(day)){
                return i[day].includes(roll)
            }
        }
    }

    const extract = (roll, day, e) => {
        e.target.style.backgroundColor = e.target.style.backgroundColor === 'green' ? 'red' : 'green'
        e.target.style.color = 'white'
        setPresent(prev => prev.includes(roll) ? prev.filter(el => el !== roll) : [...prev, roll])
    }

    const markAttendance = async () => {
        const opt = confirm('Are you sure?')
        if(!opt){
            return
        }
        const dataToSend = {
            name: details.staff.name,
            section: details.staff.section,
            grade: details.staff.grade,
            year: currentYear,
            month: currentMonth,
            day: currentDate,
            students: present,
        }
        try{
            const response = await fetch('http://localhost:3000/staff/markAttendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details: encryptRandom(JSON.stringify(dataToSend)) }),
            })
            const data = await response.json()
            if(data.status === 'success'){
                alert(data.message)
                navigate(-1)
            }
            else{
                alert(data.message)
            }
        }
        catch(err){
            console.error(err)
            alert('Something went wrong!')
        }
    }

    return (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',overflow:'auto',scrollBehavior:'smooth'}}>
            <h1 className='welcome-note'>Attendance</h1>
            <h2 className='welcome-note'>{currentDate} - {currentMonth} - {currentYear}</h2>
            <br />
            <table className='teacher-timetable' border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Students</th>
                        {days.map((day) => {
                            const isLocked = isDateLocked(currentYear, currentMonth, day)
                            return (
                                <th
                                    key={day}
                                    style={{
                                        backgroundColor: isLocked ? '#ccc' : 'white',
                                        color: isLocked ? '#666' : 'black',
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    {day}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {details.studentList?.sort((a,b)=>a.roll-b.roll).map((student, index) => (
                        <tr key={index}>
                            <td>{student.name}</td>
                            {days.map((day) => {
                                const isLocked = isDateLocked(currentYear, currentMonth, day)
                                return (
                                    <td
                                        key={day}
                                        onClick={!isLocked ? (e) => extract(student.roll, day, e) : undefined}
                                        style={{
                                            backgroundColor: isLocked ? isPast(day,student.roll) ? 'grey' : '#eee' : isPresent(day,student.roll) ? 'green' :
                                             'rgba(240, 0, 0, 0.9)',
                                            color: isLocked ? isPast(day,student.roll) ? '#fff' : '#999' : 'white',
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            pointerEvents: isLocked ? 'none' : 'auto',
                                        }}
                                    >
                                        {isPresent(day,student.roll) ? isPast(day,student.roll) ?'P': day : day }
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <span style={{fontFamily:'Poppins', margin: '10px', fontSize: '1.1rem'}}><i className='bx bx-body' style={{marginRight: '10px'}}></i>Strength: <span style={{color:"blue"}}>{details.studentList?.length || 0}</span></span><br />
            <span style={{fontFamily:'Poppins', margin: '10px', fontSize: '1.1rem'}}><i className='bx bxl-apple' style={{color:'green',marginRight: '10px'}}></i>Present: <span style={{color:"green"}}>{present.length}</span></span><br />
            <span style={{fontFamily:'Poppins', margin: '10px', fontSize: '1.1rem'}}><i className='bx bxl-facebook' style={{color:'red',marginRight: '10px'}}></i>Absent: <span style={{color:'red'}}>{(details?.studentList?.length || 0) - present?.length}</span></span><br />
            <button style={{border:'none', background:'#1f1f1f', color: 'white',padding:'10px', margin: '10px',borderRadius: '10px',cursor: 'pointer'}} onClick={markAttendance}>Mark Attendance</button>
            {socketConn && details.staff.grade.trim() !== '' && <StaffChatPanel socket={socketConn} gradeFromLogin={details.staff.grade} sectionFromLogin={details.staff.section} myMail={details.staff.email}/>}
        </div>
    )
}

export default Attendance
