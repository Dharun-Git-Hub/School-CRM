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
    const [openChat,setOpenChat] = useState(false)
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
        <div>
            Welcome, Super Admin!
            <SuperSubject/>
            <SuperGrade/>
            <SuperStaff/>
            <SuperAdminStudent/>
            <SuperAddGradeAdmin/>
            <button className='float-btn' style={{right: openChat && '95vw', background: openChat && 'black'}} onClick={()=>setOpenChat(prev=>!prev)}>{!openChat ? 'Chat' : 'Close'}</button>
            {
                openChat && 
                <SuperAdminPanel socket={socket} />
            }
            <button onClick={()=>navigate('/super-logs')}>Logs</button>
            <button onClick={handleReset}>Hard Reset</button>
        </div>
    )
}

export default SuperAdminDash