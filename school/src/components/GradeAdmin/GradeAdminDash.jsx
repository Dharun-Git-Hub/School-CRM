import GradeStaff from './GradeStaff'
import GradeSubject from './GradeSubject'
import GradeAdminStudent from './GradeAdminStudent'
import GradeSection from './GradeSection'
import { useNavigate } from 'react-router-dom'
import { useContext, useDebugValue, useEffect, useState } from 'react'
import GradeAdminPanel from '../../Chat/GradeAdminPanel'
import { ChatContext } from '../../Context/ChatContext'
import { ValidateStudent } from '../../slices/Login/LoginStudentSlice'
import { useDispatch } from 'react-redux'

const GradeAdminDash = ({socket}) => {
    const navigate = useNavigate()
    const [myGrade,setMyGrade] = useState('')
    const {setSocketConn} = useContext(ChatContext)
    const dispatch = useDispatch()
    const [counts,setCounts] = useState(null)

    const CountsComponent = ({studentsCount,teachersCount,sectionsCount,subjectsCount}) => {
        return (
            <div style={{position:'fixed', bottom:'2vh', left: '1vw', background:'white',padding: '10px',boxShadow: '0 0 5px silver',cursor: 'pointer',border: 'none',borderRadius:'10px',
                display:'flex',gap:'10px',fontFamily:'Poppins',fontSize:'0.7rem'
            }}>
                <span>Students: {studentsCount}</span>
                <span>Teachers: {teachersCount}</span>
                <span>Sections: {sectionsCount}</span>
                <span>Subjects: {subjectsCount}</span>
            </div>
        )
    }
    
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

    useEffect(()=>{
        const getCounts = async () => {
            try{
                const response = await fetch('http://localhost:3000/grade/getCounts',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({details:myGrade})
                })
                const data = await response.json()
                console.log(data)
                setCounts(data.countList)
            }
            catch(err){
                console.log(err)
                alert('Something went wrong')
            }
        }
        getCounts()
    },[myGrade])

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
            {counts !== null && counts.hasOwnProperty('studentsCount') && 
            <CountsComponent 
                studentsCount={counts.studentsCount}
                teachersCount={counts.teachersCount}
                sectionsCount={counts.sectionsCount}
                subjectsCount={counts.subjectsCount}
                />
            }
        </div>
    )
}

export default GradeAdminDash