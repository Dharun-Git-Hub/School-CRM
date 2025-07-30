import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'

const Field = ({gradeList,fieldIndex, fieldData, updateField, removeField, canRemove, myGrade}) => {
    const [grades, setGrades] = useState(gradeList)
    const [name,setName] = useState(fieldData.name)
    const [grade,setGrade] = useState(fieldData.grade)

    useEffect(() => {
        setName(fieldData.name || '')
        setGrade(fieldData.grade || '')
    }, [fieldData.name, fieldData.grade])

    useEffect(() => {
        updateField(fieldIndex, { name, grade })
    }, [name, grade])

    const handleAdd = (val) => {
        const exists = grades.some(el=>el===val)
        if(exists) setGrade(val)
        else setGrade('')
    }

    return (
        <div style={{border: '1px solid #ccc', padding: 10, marginBottom: 10}}>
            <input placeholder='Section Name' value={name} onChange={e => setName(e.target.value)}/>
            <input placeholder='Grade' value={grade} list="grade-list" onChange={(e)=>handleAdd(e.target.value)}/>
            <datalist id="grade-list">
                {
                    grades.filter(e=>e===myGrade).map((el,index)=>(
                        <option key={index} value={el}>{el}</option>
                    ))
                }
            </datalist>
            {canRemove && <button type="button" onClick={() => removeField(fieldIndex)}>- Remove Field</button>}
        </div>
    )
}

const GradeSection = ({myGrade}) => {
    const [file,setFile] = useState(null)
    const [fields, setFields] = useState([{ name: '', grade: '' }])
    const [gradeList,setGrades] = useState([])

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
        }
        doFirst()
    },[])

    const addField = () => {
        setFields(prev => [...prev, { name: '', grade: '', students: [] }])
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
            const response = await fetch('http://localhost:3000/grade/uploadSectionByExcel',{
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
            alert('Please Create Sections to Add them!')
            return
        }
        for(let i=0;i<fields.length;i++){
            if(fields[i].name.trim() === '' || fields[i].grade.trim() === ''){
                alert('Fill up all the fields!')
                return;
            }
        }
        console.log(fields)
        try{
            const details = JSON.stringify({fields,myGrade:myGrade})
            console.log(details)
            const response = await fetch('http://localhost:3000/grade/uploadSectionManually',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details: encryptRandom(details)})
            })
            const data = await response.json()
            console.log(data)
            if(data.status === 'success'){
                alert(data.message)
                setFields([{ name: '', grade: '', students: [] }])
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
            <h1>Add Section</h1>
            <input type="file" accept='.xlsx' onChange={(e)=>setFile(e.target.files[0])}/>
            <button style={{background: '#1f1f1f',color:'white'}} onClick={handleUpload}>Upload using Excel Sheet</button>
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
                    myGrade={myGrade}
                />
            ))}
            <button onClick={addSubject}>Register Sections</button>
        </div>
    )
}

export default GradeSection