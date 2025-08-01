import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'

const Field = ({gradeList, subjectsList, fieldIndex, fieldData, updateField, removeField, sectionList, canRemove, myGrade}) => {
    const [grades, setGrades] = useState(gradeList)
    const [name,setName] = useState(fieldData.name || '')
    const [email,setEmail] = useState(fieldData.email || '')
    const [phone, setPhone] = useState(fieldData.phone || '')
    const [role, setRole] = useState(fieldData.role || '')
    const [grade, setGrade] = useState(fieldData.grade || '')
    const [section, setSection] = useState(fieldData.section || '')
    const [subject, setSubject] = useState(fieldData.subject || '')
    const [code,setCode] = useState(fieldData.code || '')

    useEffect(() => {
        setName(fieldData.name || '')
        setEmail(fieldData.email || '')
        setPhone(fieldData.phone || '')
        setRole(fieldData.role || '')
        setGrade(fieldData.grade || '')
        setSection(fieldData.section || '')
        setSubject(fieldData.subject || '')
        setCode(fieldData.code || '')
    },[fieldData.name, fieldData.email, fieldData.phone, fieldData.role, fieldData.grade, fieldData.section, fieldData.subject, fieldData.code])

    useEffect(() => {
        if(gradeList.find(el=>el===grade)){
            updateField(fieldIndex, { name, email, phone, role, grade, section, subject, code })
        }
        else{
            setGrade('')
        }
        const exists = sectionList.filter(el=>el.grade===grade)
        if(exists.find(el=>el.name===section)){
            updateField(fieldIndex, { name, email, phone, role, grade, section, subject,code })
        }
        else{
            setSection('')
        }
        if(subjectsList.find(el=>el===subject)){
            updateField(fieldIndex, { name, email, phone, role, grade, section, subject,code })
        }
        else{
            setSubject('')
        }
    }, [name, email, phone, role, grade, section, subject,code])

    return (
        <div style={{border: '1px solid #ccc', padding: 10, marginBottom: 10}}>
            <input placeholder='Name' value={name} onChange={e => setName(e.target.value)}/>
            <input placeholder='Email' value={email} type='email' onChange={e => setEmail(e.target.value)}/>
            <input placeholder='Phone' value={phone} type="number" onChange={e => setPhone(e.target.value)}/>
            <input placeholder='Role' value={role} onChange={e => setRole(e.target.value)}/>
            <datalist id="grade-list">
                {
                    gradeList.filter(e=>e===myGrade).map((el,index)=>(
                        <option key={index}>{el}</option>
                    ))
                }
            </datalist>
            <input placeholder='Grade' value={grade} list="grade-list" onChange={e => setGrade(e.target.value)}/>
            <datalist id="sections">
                {
                    sectionList.filter(el=>el.grade===grade)
                    .map((el,index)=>(
                        <option key={index}>{el.name}</option>
                    ))
                }
            </datalist>
            <input placeholder='Section' list="sections" value={section} onChange={e => setSection(e.target.value)}/>
            <input placeholder='Subject' list="sub-list" value={subject} onChange={e => setSubject(e.target.value)}/>
            <datalist id="sub-list">
                {
                    subjectsList.map((el,index)=>(
                        <option key={el} value={el}>{el}</option>
                    ))
                }
            </datalist>
            <input placeholder='Subject Code' value={code} onChange={e => setCode(e.target.value)}/>
            {canRemove && <button type="button" onClick={() => removeField(fieldIndex)}>- Remove Field</button>}
        </div>
    )
}

const GradeStaff = ({myGrade}) => {
    const [file,setFile] = useState(null)
    const [fields, setFields] = useState([{ name: "", email: "", phone: "", role: "", grade: "", section: "", subject: "", code: "" }])
    const [gradeList,setGrades] = useState([])
    const [sectionList,setSections] = useState([])
    const [subjectsList,setSubjects] = useState([])

    useEffect(()=>{
        const doFirst = async () => {
            try{
                const response = await fetch('http://localhost:3000/grade/getGrades');
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
                const response = await fetch('http://localhost:3000/grade/getSections',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({details:myGrade})
                });
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
            try{
                const response = await fetch('http://localhost:3000/grade/getSubjects');
                const data = await response.json()
                if(data.status === 'success'){
                    console.log(data.list)
                    setSubjects([...new Set(data.list)])
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

    const addField = () => {
        setFields(prev => [...prev, { name: "", email: "", phone: "", role: "", grade: "", section: "", subject: "", code: '' }])
    }
    const removeField = (index) => {
        setFields(prev => prev.filter((_, i) => i !== index))
    }
    const updateField = (index, data) => {
        setFields(prev => prev.map((f, i) => i === index ? { ...f, ...data } : f))
    }

    useEffect(()=>{
        console.log(fields)
    },[fields])

    const handleUpload = async() => {
        try{
            if(file===null){
                alert('Select a Excel File first!')
                return;
            }
            const formData = new FormData()
            formData.append('file',file)
            console.log(formData.get("file"))
            formData.append('myGrade',myGrade)
            const response = await fetch('http://localhost:3000/grade/addTeacherByExcel',{
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                alert('Data Uploaded Successfully!')
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

    const addSubject = async () => {
        if(fields.length < 1){
            alert('Please Create Staff to Add them!')
            return
        }
        for(let i=0;i<fields.length;i++){
            if(fields[i].name.trim() === '' || fields[i].email.trim() === '' || fields[i].phone.trim() === '' || fields[i].role.trim() === '' || fields[i].grade.trim() === '' || fields[i].section.trim() === '' || fields[i].subject.trim() === '' || fields[i].code.trim() === ''){
                alert('Fill up all the fields!')
                return;
            }
        }
        for(let i=0;i<fields.length;i++){
            const exists = gradeList.find(el=>el===fields[i].grade)
            if(!exists){
                alert('Please insert available Grades only!')
                return;
            }
        }
        console.log(fields)
        try{
            const details = JSON.stringify({fields,myGrade:myGrade})
            const response = await fetch('http://localhost:3000/grade/addTeacherManually',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details: encryptRandom(details)})
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                alert('Teacher(s) Created!')
                setFields([{ name: "", email: "", phone: "", role: "", grade: "", section: "", subject: "",code: '' }])
                return;
            }
            else{
                alert(data.message)
                return;
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
        }
    }

    return (
        <div className='dash-div'>
            <h1>Add Staff</h1>
            <input type="file" accept='.xlsx' onChange={(e)=>setFile(e.target.files[0])}/>
            <button style={{background: '#1f1f1f',color:'white'}} onClick={handleUpload}>Upload using Excel Sheet</button>
            <button type="button" onClick={addField}>+ Add Field</button>
            {gradeList.length > 0 && fields.map((field, index) => (
                <Field
                    key={index}
                    gradeList={gradeList}
                    subjectsList={subjectsList}
                    fieldIndex={index}
                    fieldData={field}
                    updateField={updateField}
                    removeField={removeField}
                    sectionList={sectionList}
                    canRemove={fields.length>1}
                    myGrade={myGrade}
                />
            ))}
            <button onClick={addSubject}>Register Staff</button>
        </div>
    )
}

export default GradeStaff