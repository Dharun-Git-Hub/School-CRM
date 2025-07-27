import { useState, useEffect } from 'react'

const GradeLogs = () => {
    const [logs,setLogs] = useState([])

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
        <div>
            Logs
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
        </div>
    )
}

export default GradeLogs