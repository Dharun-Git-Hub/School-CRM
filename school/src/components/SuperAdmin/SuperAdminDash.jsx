import { useState, useEffect } from 'react'
import SuperSubject from './SuperSubject'
import SuperGrade from './SuperGrade'
import SuperStaff from './SuperStaff'
import SuperAdminStudent from './SuperAdminStudent'
import SuperAddGradeAdmin from './SuperAddGradeAdmin'
import { useNavigate } from 'react-router-dom'
import SuperAdminPanel from '../../Chat/SuperAdminPanel'
import '../styles/styles.css'
import { ValidateStudent } from '../../slices/Login/LoginStudentSlice'
import { useDispatch } from 'react-redux'

const SuperAdminDash = ({socket}) => {
    const navigate = useNavigate()
    const [counts,setCounts] = useState(null)

    const dispatch = useDispatch()

    const CountsComponent = ({studentsCount,teachersCount,gradesCount,subjectsCount}) => {
        return (
            <div style={{position:'fixed', bottom:'2vh', left: '1vw', background:'white',padding: '10px',boxShadow: '0 0 5px silver',cursor: 'pointer',border: 'none',borderRadius:'10px',
                display:'flex',gap:'10px',fontFamily:'Poppins',fontSize:'0.7rem'
            }}>
                <span>Students: {studentsCount}</span>
                <span>Teachers: {teachersCount}</span>
                <span>Grades: {gradesCount}</span>
                <span>Subjects: {subjectsCount}</span>
                <i title='Overview' className='bx bx-bell' style={{fontSize:'0.8rem',color:'#ff2976'}} onClick={()=>navigate('super-overview')}></i>
            </div>
        )
    }

    useEffect(()=>{
        const getCounts = async () => {
            try{
                const response = await fetch('http://localhost:3000/super/getCounts')
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
    },[])
    
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
    
    const handleReset = async() => {
        const opt = confirm('Are you sure?')
        if(opt){
            const opt2 = confirm("This will clear literally all the Data. Are you really sure?")
            if(opt2){
                try{
                    const response = await fetch('http://localhost:3000/super/resetAll');
                    const data = await response.json()
                    if(data.status==='success'){
                        alert(data.message)
                        navigate(0)
                    }
                    else{
                        alert(data.message)
                    }
                }
                catch(err){
                    console.log(err)
                    alert("Something went wrong!")
                }
            }
        }
        else{
            return;
        }
    }

    return (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',overflow:'auto',scrollBehavior:'smooth'}}>
            <div className='nav-note'>
                <span className='welcome-note'>Welcome, Super Admin!</span>
                <div>
                    <button onClick={()=>navigate('/super-logs')}>Logs</button>
                    <button style={{background: 'black', color: 'white'}} onClick={handleReset}>Hard Reset</button>
                </div>
            </div>
            <div style={{display: 'flex'}}>
                <SuperSubject/>
                <SuperGrade/>
                <SuperStaff/>
                <SuperAdminStudent/>
                <SuperAddGradeAdmin/>
                {socket && <SuperAdminPanel socket={socket}/>}
                {counts !== null && counts.hasOwnProperty('studentsCount') && 
                <CountsComponent 
                    studentsCount={counts.studentsCount}
                    teachersCount={counts.teachersCount}
                    gradesCount={counts.gradesCount}
                    subjectsCount={counts.subjectsCount}
                    />
                }
            </div>
        </div>
    )
}

export default SuperAdminDash