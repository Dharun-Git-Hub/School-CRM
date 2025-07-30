import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'

const Fields = ({fieldIndex,fieldData,updateField,removeField,gradeList,sectionList,canRemove}) => {
    const [name,setName] = useState(fieldData.name || '')
    const [roll,setRoll] = useState(fieldData.roll || '')
    const [adno,setAdno] = useState(fieldData.adno || '')
    const [dob,setDob] = useState(fieldData.dob || '')
    const [gender,setGender] = useState(fieldData.gender || '')
    const [grade,setGrade] = useState(fieldData.grade || '')
    const [section,setSection] = useState(fieldData.section || '')
    const [acyear,setAcyear] = useState(fieldData.acyear || '')
    const [address,setAddress] = useState(fieldData.address || '')
    const [email,setEmail] = useState(fieldData.email || '') 
    console.log(gradeList)

    useEffect(()=>{
        setName(fieldData.name)
        setRoll(fieldData.roll)
        setAdno(fieldData.adno)
        setDob(fieldData.dob)
        setGender(fieldData.gender)
        setGrade(fieldData.grade)
        setSection(fieldData.section)
        setAcyear(fieldData.acyear)
        setAddress(fieldData.address)
        setEmail(fieldData.email)
    },[fieldData.name,fieldData.roll,fieldData.adno,fieldData.section,fieldData.gender,fieldData.grade,fieldData.email,fieldData.acyear,fieldData.dob,fieldData.address])

    useEffect(()=>{
        if(gradeList.find(el=>el===grade)){
            updateField(fieldIndex,{name,roll,adno: Number(adno),section,gender,grade,email,acyear,dob,address})
        }
        else{
            setGrade('');
        }
        const exists = sectionList.filter(el=>el.grade===grade)
        if(exists.find(el=>el.name===section)){
            updateField(fieldIndex,{name,roll,adno: Number(adno),section,gender,grade,email,acyear,dob,address})
        }
        else{
            setSection('')
        }
    },[name,roll,adno,section,gender,grade,email,acyear,dob,address])

    return (
        <div>
            <input placeholder='Name' value={name} onChange={e=>setName(e.target.value)}/>
            <input placeholder='Roll' value={roll} onChange={e=>setRoll(e.target.value)}/>
            <input placeholder='Admission Number' value={adno} onChange={e=>setAdno(e.target.value)}/>
            <div style={{display: 'flex',alignItems:'center', marginLeft:'10px',fontFamily:'Poppins',fontSize:'0.8rem'}}>Date Of Birth
                <input placeholder='DOB' type="date" value={dob} onChange={e=>setDob(e.target.value)} min={"2000-11-30"} max={"2004-11-30"}/>
            </div>
            <input placeholder='Email' type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
            <br/>
            <span style={{fontFamily: 'Poppins',fontSize: '0.8rem',marginLeft:'10px'}}>Male</span><input style={{cursor:'pointer'}} type="radio" name="forgender" value={"Male"} onChange={e=>setGender(e.target.value)}/>
            <span style={{fontFamily: 'Poppins',fontSize: '0.8rem',marginLeft:'10px'}}>Female</span><input style={{cursor:'pointer'}} type="radio" name="forgender" value={"Female"} onChange={e=>setGender(e.target.value)}/>
            <input placeholder='Grade' list="list-grades" value={grade} onChange={e=>setGrade(e.target.value)}/>
            <datalist id="list-grades">
                {
                    gradeList.map((el,index)=>(
                        <option key={index} value={el}>{el}</option>
                    ))
                }
            </datalist>
            <input placeholder='Section' list="list-sections" value={section} onChange={e=>setSection(e.target.value)}/>
            <datalist id="list-sections">
                {
                    sectionList
                        .filter(el => el.grade === grade)
                        .map((el, index) => (
                            <option key={index} value={el.name}>{el.name}</option>
                        ))
                }
            </datalist>
            <div style={{display: 'flex',alignItems:'center', marginLeft:'10px',fontFamily:'Poppins',fontSize:'0.8rem'}}>Academic Year
                <input type="date" placeholder='Current Academic Year' value={acyear} onChange={e=>setAcyear(e.target.value)}/>
            </div>
            <textarea placeholder='Address' value={address} onChange={e=>setAddress(e.target.value)}/>
            {canRemove && <button type="button" onClick={() => removeField(fieldIndex)}>- Remove Field</button>}
        </div>
    )
}

const SuperAdminStudent = () => {

    const [fields,setFields] = useState([{name: "", roll: "", adno: "", dob: "", gender: "", grade: "", email: "", section: "", acyear: "", address: ""}])
    const [gradeList,setGrades] = useState([])
    const [subjectList,setSubjects] = useState([])
    const [sectionList,setSections] = useState([])
    const [file,setFile] = useState(null)

    const addField = () => {
        setFields(prev=>[...prev,{name: "", roll: "", adno: "", dob: "", gender: "", grade: "", email: "", section: "", acyear: "", address: ""}])
    }

    const removeField = (index) => {
        setFields(prev=>prev.filter((el,i)=>i!==index))
    }

    const updateField = (index,data) => {
        setFields(prev=>prev.map((f,i)=>i===index?{...f,...data}:f))
    }

    useEffect(()=>{
        console.log(fields)
    },[fields])

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
            try{
                const response = await fetch('http://localhost:3000/super/getSections');
                const data = await response.json()
                if(data.status === 'success'){
                    console.log(data.list)
                    setSections(data.list)
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

    const handleRegister = async () => {
        for(let i =0; i<fields.length; i++){
            if(
                fields[i].name.trim() === '' || 
                fields[i].roll.trim() === '' ||
                fields[i].adno === 0 ||
                fields[i].dob.trim() === '' ||
                fields[i].gender.trim() === '' ||
                fields[i].grade.trim() === '' ||
                fields[i].section.trim() === '' ||
                fields[i].acyear.trim() === '' ||
                fields[i].address.trim() === '' ||
                fields[i].email.trim() === ''
            ){
                alert('Please check out all the fields!')
                return;
            }
        }
        fields.map((el)=>console.log(el.acyear))
        for(let i=0;i<fields.length;i++){
            fields[i].acyear = new Date(fields[i].acyear).toLocaleDateString().split("/").pop().toString()
        }
        try{
            console.table(fields)
            const details = encryptRandom(JSON.stringify(fields))
            const response = await fetch('http://localhost:3000/super/addStudentManually',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details: details})
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                setFields([{name: "", roll: "", adno: "", dob: "", gender: "", grade: "", email: '', section: "", acyear: "", address: ""}])
                alert('Uploaded Successfully')
                return
            }
            else{
                alert(data.message)
                return;
            }
        }
        catch(err){
            alert('Something went wrong!')
            console.log(err)
        }
    }

    const handleUpload = async () => {
        if(file===null){
            alert('Please select a file to upload!')
            return;
        }
        try{
            const formData = new FormData()
            formData.append('file',file)
            const response = await fetch('http://localhost:3000/super/addStudentByExcel',{
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                alert('Uploaded Successfully')
                setFields([{name: "", roll: "", adno: "", dob: "", gender: "", grade: "", email: '', section: "", acyear: "", address: ""}])
                return;
            }
            else{
                alert(data.message)
                return;
            }
        }
        catch(err){
            alert('Something went wrong!')
            console.log(err)
        }
    }

    return (
        <div className='dash-div'>
            <h1>Add Student</h1>
            <input type="file" accept='.xlsx' onChange={e=>setFile(e.target.files[0])}/>
            <button onClick={handleUpload}>Upload using Excel</button>
            {
                gradeList.length > 0 && sectionList.length > 0 && fields.map((el,index)=>(
                    <Fields
                        key={index}
                        fieldIndex = {index}
                        fieldData = {el}
                        updateField = {updateField}
                        removeField = {removeField}
                        gradeList={gradeList}
                        sectionList={sectionList}
                        canRemove = {fields.length>1}
                    />
                ))
            }
            <button onClick={addField}>+ Student</button>
            <button style={{background: '#1f1f1f',color:'white'}} onClick={handleRegister}>Register Students</button>
        </div>
    )
}

export default SuperAdminStudent