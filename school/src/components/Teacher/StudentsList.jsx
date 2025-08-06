import axios from 'axios'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ToastContainer,toast } from 'react-toastify'

const StudentsList = () => {
    const [studentsList,setStudentsList] = useState([])
    const location = useLocation()
    const details = location.state || null

    useEffect(()=>{
        const getList = async () => {
            try{
                const response = await axios.post('http://localhost:3000/staff/giveStudentList',{section:details.section,grade:details.grade});
                console.log(response.data)
                setStudentsList(response.data.list)
            }
            catch(err){
                console.log(err)
                alert('Something went wrong!')
            }
        }
        getList()
    },[details])

    const handleMail = (email) => {
        navigator.clipboard.writeText(email)
        toast(`Email Copied to Clipboard ❤️`)
    }

    return (
        <div className='dash-div'>
            <h1>Students</h1>
            {
                studentsList?.length > 0 && 
                <table style={{cursor: 'pointer'}} className='teacher-timetable2'>
                    <thead>
                        <th>Name</th>
                        <th>DOB</th>
                        <th>Roll</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Attendance</th>
                        <th>Admission No.</th>
                    </thead>
                    <tbody>
                        {
                            studentsList.sort((a,b)=>a.roll-b.roll).map((el,index)=>(
                                <tr key={index}>
                                    <td>{el.name}</td>
                                    <td>{new Date(el.dob).toLocaleDateString()}</td>
                                    <td>{el.roll}</td>
                                    <td onClick={()=>handleMail(el.email)}>{el.email}</td>
                                    <td>{el.address}</td>
                                    <td>{el.attendance}%</td>
                                    <td>{el.admission_no}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
            <ToastContainer autoClose={3000} position='top-center' toastStyle={{color: 'black', background: 'white'}}/>
        </div>
    )
}

export default StudentsList