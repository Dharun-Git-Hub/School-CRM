import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'
import { useNavigate } from 'react-router-dom'

const StudentForgot = () => {
    const [email,setEmail] = useState('')
    const navigate = useNavigate()

    const sendLink = async() => {
        if(email.trim()!==''){
            console.log({email:encryptRandom(email)})
            try{
                const response = await fetch('http://localhost:3000/student/sendLink',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({email: encryptRandom(JSON.stringify({email:email}))})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success')
                    navigate('/login-student')
                else{
                    alert(data.message)
                    return
                }
            }
            catch(err){
                console.log(err)
            }
        }
        else{
            alert('Please checkout all the fields')
            return
        }
    }
    return (
        <div>
            <input type="email" placeholder='Enter your registered Email' onChange={(e)=>setEmail(e.target.value)}/>
            <button onClick={sendLink}>Send Link</button>
        </div>
    )
}

export default StudentForgot