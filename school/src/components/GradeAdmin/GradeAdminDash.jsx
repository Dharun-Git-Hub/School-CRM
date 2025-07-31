import GradeStaff from './GradeStaff'
import GradeSubject from './GradeSubject'
import GradeAdminStudent from './GradeAdminStudent'
import GradeSection from './GradeSection'
import { useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import GradeAdminPanel from '../../Chat/GradeAdminPanel'
import { ChatContext } from '../../Context/ChatContext'

const GradeAdminDash = ({socket}) => {
    const navigate = useNavigate()
    const [myGrade,setMyGrade] = useState('')
    const {setSocketConn} = useContext(ChatContext)

    useEffect(()=>{
        setSocketConn(socket)
    },[myGrade])

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
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',overflow:'auto',scrollBehavior:'smooth'}}>
            <div>
                <div className='nav-note'>
                    <span className='welcome-note'>Welcome, Grade Admin!</span>
                    <div>
                        <button onClick={()=>navigate('/grade-logs',{state:myGrade})}>Logs</button>
                        <button style={{background: '#1f1f1f',color:'white'}} onClick={()=>navigate('/grade-timeslots',{state:myGrade})}>Timeslots</button>
                    </div>
                </div>
                <div style={{display: 'flex'}}>
                    { myGrade.trim() !== '' &&
                        <>
                            <GradeStaff myGrade={myGrade}/>
                            <GradeSubject myGrade={myGrade}/>
                            <GradeAdminStudent myGrade={myGrade}/>
                            <GradeSection myGrade={myGrade}/>
                        </>
                    }
                    {socket && myGrade.trim() !== '' && <GradeAdminPanel socket={socket} grade={myGrade}/>}
                </div>
            </div>
        </div>
    )
}

export default GradeAdminDash