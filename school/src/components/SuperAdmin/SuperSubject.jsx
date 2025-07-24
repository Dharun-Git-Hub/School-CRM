import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'

const Field = ({gradeList,fieldIndex, fieldData, updateField, removeField, canRemove}) => {
    const [grades, setGrades] = useState(gradeList)
    const [selected, setSelected] = useState(fieldData.selected || [])
    const [subjectName, setSubjectName] = useState(fieldData.subjectName || '')
    const [subjectCode, setSubjectCode] = useState(fieldData.subjectCode || '')

    useEffect(() => {
        setSubjectName(fieldData.subjectName || '')
        setSubjectCode(fieldData.subjectCode || '')
        setSelected(fieldData.selected || [])
    }, [fieldData.subjectName, fieldData.subjectCode, fieldData.selected])

    useEffect(() => {
        updateField(fieldIndex, { subjectName, subjectCode, selected })
    }, [subjectName, subjectCode, selected])

    const addGrade = (grade) => {
        if(selected.includes(grade)){
            setSelected(selected.filter(el => el !== grade))
        }
        else{
            setSelected(prev => [...prev, grade])
        }
    }

    return (
        <div style={{border: '1px solid #ccc', padding: 10, marginBottom: 10}}>
            <input placeholder='Subject Name' value={subjectName} onChange={e => setSubjectName(e.target.value)}/>
            <input placeholder='Subject Code' value={subjectCode} onChange={e => setSubjectCode(e.target.value)}/>
            <div style={{margin: '10px 0'}}>
                {grades.map((grade, index)=>(
                    <label key={index}> {grade}
                        <input type="checkbox" value={grade} checked={selected.includes(grade)} onChange={() => addGrade(grade)}/>
                    </label>
                ))}
            </div>
            {canRemove && <button type="button" onClick={() => removeField(fieldIndex)}>- Remove Field</button>}
        </div>
    )
}

const SuperSubject = () => {
    const [file,setFile] = useState(null)
    const [fields, setFields] = useState([{ subjectName: '', subjectCode: '', selected: [] }])
    const [gradeList,setGrades] = useState([])

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

    const addField = () => {
        setFields(prev => [...prev, { subjectName: '', subjectCode: '', selected: [] }])
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
            const response = await fetch('http://localhost:3000/super/uploadExcel',{
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
        }
    }

    const addSubject = async () => {
        if(fields.length < 1){
            alert('Please Create Subjects to Add them!')
            return
        }
        for(let i=0;i<fields.length;i++){
            if(fields[i].subjectName.trim() === '' || fields[i].subjectCode.trim() === ''){
                alert('Fill up all the fields!')
                return;
            }
        }
        console.log(fields)
        try{
            const details = JSON.stringify(fields)
            const response = await fetch('http://localhost:3000/super/uploadManual',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details: encryptRandom(details)})
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                alert('Subjects Created!')
                setFields([{ subjectName: '', subjectCode: '', selected: [] }])
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
        <div>
            <h1>Add Subject</h1>
            <input type="file" accept='.xlsx' onChange={(e)=>setFile(e.target.files[0])}/>
            <button onClick={handleUpload}>Upload using Excel Sheet</button>
            <button type="button" onClick={addField}>+ Add Field</button>
            {gradeList.length > 0 && fields.map((field, index) => (
                <Field
                    key={index}
                    gradeList={gradeList}
                    fieldIndex={index}
                    fieldData={field}
                    updateField={updateField}
                    removeField={removeField}
                    canRemove={fields.length>1}
                />
            ))}
            <button onClick={addSubject}>Register Subjects</button>
        </div>
    )
}

export default SuperSubject