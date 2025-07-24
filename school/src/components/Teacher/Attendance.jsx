import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { decryptRandom, encryptRandom } from '../../Security/Encryption'

const Attendance = () => {
    const location = useLocation()
    const details = location.state || {}
    const navigate = useNavigate()

    const today = new Date()

    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
    const [currentDate, setCurrentDate] = useState(today.getDate())
    const [totalDays, setTotalDays] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
    const [days, setDays] = useState([])
    const [sundays, setSundays] = useState([])
    const [present, setPresent] = useState([])
    const [history, setHistory] = useState({})

    useEffect(() => {
        const getAttendanceData = async () => {
            try {
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
                if (data.status === 'success') {
                    setHistory(JSON.parse(decryptRandom(data.list)))
                } else {
                    alert(data.message)
                }
            } catch (err) {
                console.error(err)
                alert('Something went wrong!')
            }
        }
        getAttendanceData()
    }, [currentMonth])

    useEffect(() => {
        const newDays = Array.from({ length: totalDays }, (_, i) => i + 1)
        setDays(newDays)
        setSundays(getSundays(currentYear, currentMonth))
    }, [currentMonth, totalDays])

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
        if (selected.getDay() === 0 || selected.getDay() === 6) return true
        if (selected > today) return true
        if (!isSameDate(selected, today)) return true
        return false
    }

    const extract = (roll, day, e) => {
        e.target.style.backgroundColor = e.target.style.backgroundColor === 'green' ? 'red' : 'green'
        e.target.style.color = 'white'
        setPresent(prev =>
            prev.includes(roll)
                ? prev.filter(el => el !== roll)
                : [...prev, roll]
        )
    }

    const markAttendance = async () => {
        const dataToSend = {
            name: details.staff.name,
            section: details.staff.section,
            grade: details.staff.grade,
            year: currentYear,
            month: currentMonth,
            day: currentDate,
            students: present,
        }
        try {
            const response = await fetch('http://localhost:3000/staff/markAttendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details: encryptRandom(JSON.stringify(dataToSend)) }),
            })
            const data = await response.json()
            if (data.status === 'success') {
                alert(data.message)
                navigate(-1)
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error(err)
            alert('Something went wrong!')
        }
    }

    return (
        <div>
            <h1>Attendance</h1>
            <h2>Month: {currentMonth}</h2>
            <h3>Year: {currentYear}</h3>
            <h4>Date: {currentDate}</h4>
            <br />
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
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
                    {details.studentList?.map((student, index) => (
                        <tr key={index}>
                            <td>{student.name}</td>
                            {days.map((day) => {
                                const isLocked = isDateLocked(currentYear, currentMonth, day)
                                return (
                                    <td
                                        key={day}
                                        onClick={!isLocked ? (e) => extract(student.roll, day, e) : undefined}
                                        style={{
                                            backgroundColor: isLocked ? '#eee' : 'rgba(240, 0, 0, 0.9)',
                                            color: isLocked ? '#999' : 'black',
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            pointerEvents: isLocked ? 'none' : 'auto',
                                        }}
                                    >
                                        {day}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <span>Strength: {details.studentList?.length || 0}</span>
            <br />
            <span>Present: {present.length}</span>
            <br />
            <span>Absent: {(details.studentList?.length || 0) - present.length}</span>
            <br />
            <button onClick={markAttendance}>Mark Attendance</button>
        </div>
    )
}

export default Attendance
