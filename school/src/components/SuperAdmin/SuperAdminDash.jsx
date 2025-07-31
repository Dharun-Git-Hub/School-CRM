import { useState, useEffect } from 'react'
import SuperSubject from './SuperSubject'
import SuperGrade from './SuperGrade'
import SuperStaff from './SuperStaff'
import SuperAdminStudent from './SuperAdminStudent'
import SuperAddGradeAdmin from './SuperAddGradeAdmin'
import { useNavigate } from 'react-router-dom'
import SuperAdminPanel from '../../Chat/SuperAdminPanel'
import '../styles/styles.css'

const SuperAdminDash = ({socket}) => {
    const navigate = useNavigate()
    
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
            </div>
        </div>
    )
}

export default SuperAdminDash