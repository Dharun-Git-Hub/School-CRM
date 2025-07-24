import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'

const SuperAddGradeAdmin = () => {
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [gradeList,setGrades] = useState([])
    const [grade,setGrade] = useState('')

    useEffect(()=>{
        const doFirst = async () => {
            try{
                const response = await fetch('http://localhost:3000/super/getGrades');
                const data = await response.json()
                if(data.status === 'success'){
                    console.log(data.list)
                    setGrades(data.list)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
            }
        }
        doFirst()
    },[])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            if(email.trim() === '' || password.trim() === '' || grade.trim() === ''){
                alert('Please fill up all the required fields!')
                return;
            }
            const valid = gradeList.find(el=>el===grade)
            console.log(valid)
            if(!valid){
                alert('Please select a valie Grade')
                return
            }
            const details = encryptRandom(JSON.stringify({email:email,password:password,grade:grade}))
            const response = await fetch('http://localhost:3000/super/createGradeAdmin',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({details:details}),
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success'){
                alert(data.message)
                setEmail('')
                setPassword('')
                return;
            }
            else{
                alert(data.message)
                return
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
            return;
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} required/>
                <input type="password" placeholder='Assign Password' value={password} onChange={e=>setPassword(e.target.value)} required/>
                <datalist id="grade-list">
                    {
                        gradeList.map((el,index)=>(
                            <option key={index} value={el}>{el}</option>
                        ))
                    }
                </datalist>
                <input placeholder='Grade' list='grade-list' onChange={e=>setGrade(e.target.value)}/>
                <button type="submit">Create Grade Admin</button>
            </form>
        </div>
    )
}

export default SuperAddGradeAdmin