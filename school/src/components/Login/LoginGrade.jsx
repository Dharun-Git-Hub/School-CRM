import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LoginGradeAdmin, ValidateGradeAdmin } from '../../slices/Login/LoginGradeSlice';

const LoginGrade = () => {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('')
    const [otpPanel,setOTPPanel] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(()=>{
        const doFirst = async() => {
            if(sessionStorage.getItem('token')){
                const userDetails = await dispatch(ValidateGradeAdmin(sessionStorage.getItem('token'))).unwrap()
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
            const response = await dispatch(LoginGradeAdmin(details)).unwrap()
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
                const response = await fetch('http://localhost:3000/grade/verifyOTP',{
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
            const response = await dispatch(ValidateGradeAdmin(sessionStorage.getItem('token'))).unwrap()
            console.log(response)
            if(response==="Something went wrong!"){
                sessionStorage.removeItem('token')
                alert('Session Expired! Please login again to continue!')
            }
            else{
                navigate('/grade-admin-dash')
            }
        }
        const styles = {
            division: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '2rem'
            },
            input: {
                padding: '0.5rem',
                borderRadius: "10px",
                border: 'none'
            }
        }
        return (
            <div style={styles.division}>
                <input style={styles.input} type='number' placeholder='OTP' onChange={(e)=>setOTP(e.target.value)}/>
                <button style={{padding: "0.3rem 1rem", background: "#333", color: "#fff", marginTop:"10px"}} onClick={handleSubmitOTP}>Submit</button>
            </div>
        )
    }
    return (
        <div className='entry'>
            {
            !otpPanel ?
            <div style={{display: "flex",flexDirection: "column"}}>
                <form className='login-form' onSubmit={handleSubmit}>
                    <input autoComplete={'off'} placeholder='Email' type="email" onChange={(e)=>setEmail(e.target.value)} required/>
                    <input placeholder='Password' type="password" onChange={(e)=>setPassword(e.target.value)} required/>
                    <button style={{padding: "0.3rem 1rem", background: "#333", color: "#fff", marginTop:"10px"}} type='submit'>Login</button>
                </form>
                <span className='forgot-btn' onClick={()=>navigate('/grade-admin-forgot')}>Forgot Password?</span>
            </div>
            :
                <OTP/>
            }
        </div>
    )
}

export default LoginGrade