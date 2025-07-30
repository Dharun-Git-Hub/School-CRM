import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatContext } from '../../Context/ChatContext'
import GradeAdminPanel from '../../Chat/GradeAdminPanel'

const GradeLogs = () => {
    const [logs,setLogs] = useState([])
    const location = useLocation()
    const myGrade = location.state || null
    const {socketConn} = useContext(ChatContext)

    useEffect(()=>{
        const doFirst = async () => {
            try{
                const response = await fetch('http://localhost:3000/grade/logs');
                const data = await response.json()
                console.log(data)
                if(data.status === 'success'){
                    setLogs(data.list)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
                alert('Something went wrong!')
            }
        }
        doFirst()
    },[])
    return (
        <div className='logs-cont'>
            <ul>
                {
                    logs.map((el,index)=>(
                        <li key={index}>
                            <span><h3>Action:</h3>{el.action}</span>
                            <span><h4>By:</h4>{el.who}</span>
                            <span><h4>Time:</h4>{el.time}</span>
                        </li>
                    ))
                }
            </ul>
            <div>
                {socketConn && myGrade.trim() !== '' && <GradeAdminPanel socket={socketConn} grade={myGrade}/>}
            </div>
            
        </div>
    )
}

export default GradeLogs