import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { LoginSuperAdmin, ValidateSuperAdmin } from '../../slices/Login/LoginSlice';
import { useNavigate } from 'react-router-dom';

const LoginSuper = () => {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('')
    const [otpPanel,setOTPPanel] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(()=>{
        const doFirst = async() => {
            if(sessionStorage.getItem('token')){
                const userDetails = await dispatch(ValidateSuperAdmin(sessionStorage.getItem('token'))).unwrap()
                console.log(userDetails);
                if(userDetails === "Invalid" || userDetails === "Something went wrong!"){
                    sessionStorage.removeItem('token')
                    alert('Session Expired! Please Login again to continue!')
                    navigate('/')
                }
            }
        }
        doFirst()
    },[])

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(email.trim() != '' && password.trim() != ''){
            const details = {email: email, password: password}
            const response = await dispatch(LoginSuperAdmin(details)).unwrap()
            console.log(response)
            if(response.status === 'success'){
                setOTPPanel(true);
            }
            else{
                alert(response.message);
                return;
            }
        }
        else{
            alert('Please checkout all the fields!');
            return;
        }
    }

    const OTP = () => {
        const [otp,setOTP] = useState('');
        const dispatch = useDispatch()
        const handleSubmitOTP = async () => {
            try{
                const response = await fetch('http://localhost:3000/super/verifyOTP',{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({from: email, otp: otp}),
                })
                const data = await response.json()
                console.log(data)
                if(data.status === 'success'){
                    sessionStorage.setItem('token',data.token);
                }
                else{
                    alert(data.message);
                    return;
                }
            }
            catch(err){
                console.log(err)
            }
            const response = await dispatch(ValidateSuperAdmin(sessionStorage.getItem('token'))).unwrap()
            console.log(response)
            if(response==="Something went wrong!"){
                sessionStorage.removeItem('token')
                alert('Session Expired! Please login again to continue!')
            }
            else{
                navigate('/super-admin-dash')
            }
        }
        return (
            <>
                <input type='number' placeholder='OTP' onChange={(e)=>setOTP(e.target.value)}/>
                <button onClick={handleSubmitOTP}>Submit</button>
            </>
        )
    }
    return (
        <div>
            {
            !otpPanel ?
            <>
                <form onSubmit={handleSubmit}>
                    <input placeholder='Email' type="email" onChange={(e)=>setEmail(e.target.value)} required/>
                    <input placeholder='Password' type="password" onChange={(e)=>setPassword(e.target.value)} required/>
                    <button type='submit'>Login</button>
                </form>
                <span onClick={()=>navigate('/super-admin-forgot')}>Forgot Password?</span>
            </>
            :
                <OTP/>
            }
        </div>
    )
}

export default LoginSuper