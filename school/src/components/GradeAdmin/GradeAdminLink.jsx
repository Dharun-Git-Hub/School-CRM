import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { decryptRandom, encryptRandom } from '../../Security/Encryption'

const SuperAdminLink = () => {
    const params = useParams()
    const id = decryptRandom(params.id.toString().replaceAll(')','/'))
    const email = decryptRandom(params.email.toString().replaceAll(')','/'))
    console.log(id)
    console.log(email)
    const [password,setPassword] = useState('')
    const [newPassword,setNewPassword] = useState('')

    const changePassword = async (e) => {
        e.preventDefault()
        if(password.trim() === '' || email.trim() === '' || newPassword.trim() === ''){
            alert('Fill up all the credentials!')
            return;
        }
        if(password!==newPassword){
            alert('Passwords should be Same!')
            return;
        }
        try{
            const details = {email:email,newpassword:newPassword,id:id}
            const response = await fetch('http://localhost:3000/grade/changePassword',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details:encryptRandom(JSON.stringify(details))})
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                alert('Password Successfully changed!')
                sessionStorage.setItem('done',true)
            }
            else{
                alert('Something went wrong!')
                return;
            }
        }
        catch(err){
            console.log(err);
        }
    }
    return (
        <div>
            <h2>Set New Password</h2>
            <form onSubmit={changePassword}>
                <input placeholder='email' value={email} disabled/>
                <input placeholder='New Password' type="text" onChange={(e)=>setPassword(e.target.value)}/>
                <input placeholder='Retype New Password' type="password" onChange={(e)=>setNewPassword(e.target.value)}/>
                <button type="submit">Change Password</button>
            </form>
        </div>
    )
}

export default SuperAdminLink