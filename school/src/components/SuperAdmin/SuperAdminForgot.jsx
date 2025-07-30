import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'
import { useNavigate } from 'react-router-dom'

const SuperAdminForgot = () => {
    const [email,setEmail] = useState('')
    const navigate = useNavigate()

    const sendLink = async() => {
        if(email.trim()!==''){
            console.log({email:encryptRandom(email)})
            try{
                const response = await fetch('http://localhost:3000/super/sendLink',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({email: encryptRandom(JSON.stringify({email:email}))})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    alert('A Link is sent to your email. Please go there and follow the steps')
                    navigate('/login-super')
                }
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
    const handleKey = (e) => {
        if(e.key === 'Enter'){
            sendLink()
        }
    }
    return (
        <div className='forgot-cont'>
            <input type="email" placeholder='Enter your registered Email' onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>handleKey(e)}/>
            <button onClick={sendLink}>Send Link</button>
        </div>
    )
}

export default SuperAdminForgot