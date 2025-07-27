import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LoginStud, ValidateStudent } from '../../slices/Login/LoginStudentSlice';

const LoginStudent = () => {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(()=>{
        const doFirst = async() => {
            if(sessionStorage.getItem('token')){
                try{
                    const userDetails = await dispatch(ValidateStudent(sessionStorage.getItem('token'))).unwrap()
                    console.log(userDetails);
                    if(userDetails === "Invalid" || userDetails === "Something went wrong!"){
                        sessionStorage.removeItem('token')
                        alert('Session Expired! Please Login again to continue!')
                        navigate('/')
                    }
                }
                catch(err){
                    alert(err.message)
                }
            }
        }
        doFirst()
    },[])

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(email.trim() != '' && password.trim() != ''){
            const details = {email: email, password: password}
            const response = await dispatch(LoginStud(details)).unwrap()
            console.log(response)
            if(response.status === 'success'){
                try{
                    const result = await dispatch(ValidateStudent(sessionStorage.getItem('token'))).unwrap()
                    console.log(result)
                    sessionStorage.setItem('email',result.details.email)
                    navigate('/student-dash',{state:{details: result.details._doc}})
                }
                catch(err){
                    console.log(err);
                    alert(err.message);
                    return
                }
            }
            else{
                alert('Invalid Email or Password!')
                return
            }
        }
        else{
            alert('Please checkout all the fields!');
            return;
        }
    }

    return (
        <div className='entry' style={{flexDirection:"column"}}>
            <form className='login-form' onSubmit={handleSubmit}>
                <input placeholder='Email' type="email" onChange={(e)=>setEmail(e.target.value)} required/>
                <input placeholder='Password' type="password" onChange={(e)=>setPassword(e.target.value)} required/>
                <button style={{padding: "0.3rem 1rem", background: "#333", color: "#fff", marginTop:"10px"}} type='submit'>Login</button>
            </form>
            <span className='forgot-btn' onClick={()=>navigate('/student-forgot')}>Forgot Password?</span>
        </div>
    )
}

export default LoginStudent