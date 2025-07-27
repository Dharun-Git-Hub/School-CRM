import GradeStaff from './GradeStaff'
import GradeSubject from './GradeSubject'
import GradeAdminStudent from './GradeAdminStudent'
import GradeSection from './GradeSection'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import GradeAdminPanel from '../../Chat/GradeAdminPanel'

const GradeAdminDash = ({socket}) => {
    const navigate = useNavigate()
    const [myGrade,setMyGrade] = useState('')

    useEffect(()=>{
        const fetchGrade = async () => {
            try{
                const response = await fetch('http://localhost:3000/grade/getMyGrade',{
                    method: 'POST',
                    headers: { 'Content-Type':'application/json' },
                    body: JSON.stringify({email:sessionStorage.getItem('email')})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success')
                    setMyGrade(data.grade)
                else
                    alert('Something went wrong!')
            }
            catch(err){
                console.log(err)
                alert('Something went wrong')
            }
        }
        fetchGrade()
    },[])

    return (
        <div>
            Welcome, Grade Admin!
            <GradeStaff myGrade={myGrade}/>
            <GradeSubject myGrade={myGrade}/>
            <GradeAdminStudent myGrade={myGrade}/>
            <GradeSection myGrade={myGrade}/>
            {myGrade.trim() !== '' && <GradeAdminPanel socket={socket} grade={myGrade}/>}
            <button onClick={()=>navigate('/grade-logs')}>Logs</button>
            <button onClick={()=>navigate('/grade-timeslots')}>Timeslots</button>
        </div>
    )
}

export default GradeAdminDash