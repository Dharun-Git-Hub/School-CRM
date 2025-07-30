import { useState, useEffect } from 'react'
import { encryptRandom } from '../../Security/Encryption'

const Grade = ({fieldIndex,fieldData,removeGrade,updateGrade,canRemove}) => {
    const [grade,setGrade] = useState(fieldData.grade || '')
    const [description, setDescription] = useState(fieldData.description || '')

    useEffect(()=>{
        console.log(fieldData)
    },[])

    useEffect(()=>{
        setGrade(fieldData.grade || '')
        setDescription(fieldData.description || '')
    },[fieldData.grade,fieldData.description])

    useEffect(()=>{
        updateGrade(fieldIndex,{grade: grade, description: description})
    },[grade,description])
    
    return (
        <>
            <input placeholder='Grade' value={grade} onChange={(e)=>setGrade(e.target.value)}/>
            <input placeholder='Description' value={description} onChange={(e)=>setDescription(e.target.value)}/>
            {canRemove && <button type="button" onClick={() => removeGrade(fieldIndex)}>- Remove Field</button>}
        </>
    )
}

const SuperGrade = () => {
    const [fields,setFields] = useState([{grade: "", description: ""}])
    const [file,setFile] = useState(null)

    const addGrade = () => {
        setFields(prev=>[...prev,{grade: "", description: ""}])
    }
    const removeGrade = (index) => {
        setFields(prev=>(prev.filter((_,i)=>i!==index)))
    }
    const updateGrade = (index,data) => {
        setFields(prev=>(prev.map((f,i)=>i==index ? {...f,...data}: f)))
    }

    useEffect(()=>{
        console.log(fields)
    },[fields])
    
    const handleAddGrade = async () => {
        try{
            const dtls = encryptRandom(JSON.stringify(fields))
            const response = await fetch('http://localhost:3000/super/addGradeManually',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({details:dtls})
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success'){
                setFields([{grade: "", description: ""}])
                alert('Grade Created!')
                return
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

    const handleUpload = async () => {
        if(file===null){
            alert('Please select a file first!')
            return
        }
        try{
            const formData = new FormData()
            formData.append('file',file)
            const response = await fetch('http://localhost:3000/super/addGradeByExcel',{
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success'){
                alert('Uploaded Successfully')
            }
            else{
                alert('Grade Creation failed')
            }
        }
        catch(err){
            console.log(err)
        }
    }

    return (
        <div className='dash-div'>
            <h1>Add Grade</h1>
            <input type="file" accept='.xlsx' onChange={e=>setFile(e.target.files[0])}/>
            <button onClick={handleUpload}>Upload using Excel File</button>
            {
                fields.map((field,index)=>(
                    <Grade
                        key={index}
                        fieldIndex={index}
                        fieldData={field}
                        removeGrade={removeGrade}
                        updateGrade={updateGrade}
                        canRemove={fields.length>1}
                    />
                ))
            }
            <button onClick={addGrade}>Add Grade</button>
            <button style={{background: '#1f1f1f',color:'white'}} onClick={handleAddGrade}>Create Grades</button>
        </div>
    )
}

export default SuperGrade