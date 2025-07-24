import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption'

const Assignments = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const details = location.state.details || {}
    console.log(details)
    const [listData,setData] = useState([])
    const [file,setFile] = useState(null)
    const [submitted,setSubmitted] = useState(false)

    const getFirst = async () => {
        try{
            const obj = {
                grade: details.grade,
                section: details.section,
            }
            const response = await fetch('http://localhost:3000/student/getAssignments',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({details: encryptRandom(JSON.stringify(obj))})
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success')
                setData(data.list);
            else
                alert(data.message)
        }
        catch(err){
            console.log(err)
            alert("Something went wrong!")
        }
    }

    useEffect(()=>{
        getFirst()
    },[])

    useEffect(()=>{
        if(listData.length>0){
            for(const i of listData){
                for(const j of i.submissions){
                    if(j.student === details.name){
                        console.log('Yes')
                        setSubmitted(true)
                    }
                }
            }
        }
    },[listData])

    const handleSubmit = async (el) => {
        console.log(el)
        try{
            if(file===null){
                alert('Select a file first (pdf)')
                return
            }
            const formData = new FormData()
            formData.append('student',details.name)
            formData.append('roll',details.roll)
            formData.append('grade',details.grade)
            formData.append('section',details.section)
            formData.append('date',el.date)
            formData.append('title',el.title)
            formData.append('subject',el.subject)
            formData.append('teacher',el.teacher)
            formData.append('file',file)
            const response = await fetch('http://localhost:3000/student/submitMyAssignment',{
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            console.log(data)
            getFirst()
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
        }
    }

    useEffect(()=>{
        console.log('Test Run...')
        for(const i of listData){
            console.log(i)
        }
    },[])

    return (
        <div>
            <h1>Assignments</h1>
            <ul>
                {listData.length > 0 && listData.map((el, index) => {
                    const studentSubmission = el.submissions.find(sub => sub.student === details.name);
                    const mark = studentSubmission ? studentSubmission.marks : null;
                    const feedback = studentSubmission ? studentSubmission.feedback : null;
                    
                    return (
                        <li key={index}>
                            <span>{el.title}</span>
                            <span dangerouslySetInnerHTML={{ __html: el.description }} />
                            <span>{el.date}</span>
                            <span>{el.grade}</span>
                            <span>{el.subject}</span>
                            <span>{el.section}</span>
                            <span>{el.teacher}</span>
                            {el.attachments && (
                                <a
                                    href={URL.createObjectURL(new Blob([new Uint8Array(el.attachments.data)], { type: "application/*" }))}
                                    download={`${el.title}-${el.date}.docx`}
                                >
                                    Attachment
                                </a>
                            )}
                            <label>
                                {studentSubmission ? "Re-Upload" : "Upload"} Assignment
                                <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf" />
                            </label>
                            <button disabled={!!studentSubmission} onClick={() => handleSubmit(el)}>Submit</button>
                            {
                                studentSubmission ?
                                    <span style={{ color: 'lime' }}>Submitted</span> :
                                    <span style={{ color: 'red' }}>Not Submitted Yet!</span>
                            }
                            <br />
                            <strong>Marks: </strong> {mark !== undefined && mark !== null ? mark : "Not Yet Evaluated"}
                            <br/>
                            <strong>Feedback: </strong> {feedback?feedback:'Yet to be given'}
                        </li>
                    );
                })}
            </ul>
            
        </div>
    )
}

export default Assignments