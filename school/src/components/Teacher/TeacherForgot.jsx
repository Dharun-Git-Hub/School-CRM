import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'
import { useNavigate } from 'react-router-dom'

const TeacherForgot = () => {
    const [email,setEmail] = useState('')
    const navigate = useNavigate()

    const sendLink = async() => {
        if(email.trim()!==''){
            console.log({email:encryptRandom(email)})
            try{
                const response = await fetch('http://localhost:3000/staff/sendLink',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({email: encryptRandom(JSON.stringify({email:email}))})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    alert('A New Password Link has been sent to your Email. Please Check out!')
                    navigate('/login-staff')
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
    return (
        <div style={{display:'flex',width:'100vw',height:'100vh',alignItems:'center',justifyContent:'center'}}>
            <div className='dash-div' style={{padding:'20px',width:'30vw',display:'flex',justifyContent:'center',alignItems:'center'}}>
                <input type="email" style={{width: '20vw'}} placeholder='Enter your registered Email' onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>handleKey(e)}/>
                <button onClick={sendLink}>Send Link</button>
            </div>
        </div>
    )
}

export default TeacherForgot