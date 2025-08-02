import { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'

const StaffOverview = () => {
    const location = useLocation()
    const details = location.state || null
    const [subjects,setSubjects] = useState([])
    const [students,setStudents] = useState([])
    const [sections,setSections] = useState([])
    console.log(location)

    const handleClick = async(email) => {
        navigator.clipboard.writeText(email)
        toast(`Email Copied to Clipboard! ❤️`)
    }

    useEffect(()=>{
        const doFirst = async () => {
            if(details === null)
                return
            try{
                const response = await axios.post('http://localhost:3000/staff/getOverview',{grade:details.myGrade,section:details.mySection});
                console.log(response.data)
                if(response.data.hasOwnProperty('list')){
                    setSubjects(response.data.list.subjects)
                    setStudents(response.data.list.students)
                    setSections(response.data.list.sections)
                }
            }
            catch(err){
                console.log(err)
                alert('Something went wrong!')
            }
        }
        doFirst()
    },[])

    const alertPanel = async () => {
        alert((await navigator.clipboard.readText(0)))
    }

    return (
        <div>
            <div className='float-btn2' style={{boxShadow: 'none',background: 'transparent',position:'fixed',borderRadius:'0',width:'fit-content',display:'flex',flexDirection:'column',bottom: '2vw'}}>
                <button onClick={()=>{const sub = document.getElementById('student-note');sub.scrollIntoView({behavior:'smooth',block:'start',inline:'start'})}}>Students</button>
                <button onClick={()=>{const sub = document.getElementById('section-note');sub.scrollIntoView({behavior:'smooth',block:'start',inline:'start'})}}>Sections</button>
                <button onClick={()=>{const sub = document.getElementById('subject-note');sub.scrollIntoView({behavior:'smooth',block:'start',inline:'start'})}}>Subjects</button>
            </div>
            <span className='welcome-note' id='student-note'>Students</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Roll</th>
                        <th>Academic Year</th>
                        <th>Admission Number</th>
                        <th>DOB</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        students.map((el,index)=>(
                            <tr key={index}>
                                <td>{el.name}</td>
                                <td>{el.grade}</td>
                                <td>{el.section}</td>
                                <td>{el.roll}</td>
                                <td>{el.academic_year}</td>
                                <td>{el.admission_no}</td>
                                <td>{new Date(el.dob).toLocaleDateString()}</td>
                                <td style={{cursor: 'pointer'}} onClick={()=>handleClick(el.email)} title={el.email}>{el.email}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <span className='welcome-note' id='section-note'>Sections</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Students</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sections.map((el,index)=>(
                            <tr key={index}>
                                <td>{el.grade}</td>
                                <td>{el.name}</td>
                                <td>{el.students.map(e=>(e.name+", "))}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <span className='welcome-note' id='subject-note'>Subjects</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Subject Code</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        subjects.map((el,index)=>(
                            <tr key={index}>
                                <td>{el.name}</td>
                                <td>{el.code}</td>
                                <td>{el.grade+", "}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <ToastContainer position='bottom-center' toastStyle={{background:'rgba(1,1,1,0.05)', color:'#333'}} onClick={alertPanel}/>
        </div>
    )
}

export default StaffOverview