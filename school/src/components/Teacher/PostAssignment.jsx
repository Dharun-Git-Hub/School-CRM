import { useState, useEffect, useContext } from 'react'
import Editor from 'react-simple-wysiwyg';
import { useLocation, useNavigate } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption';
import { ChatContext } from '../../Context/ChatContext';
import StaffChatPanel from '../../Chat/StaffChatPanel'

const PostAssignment = () => {
    const location = useLocation()
    const staffDetails = location.state;
    console.log(staffDetails)
    const [title,setTitle] = useState('');
    const [description,setDescription] = useState('')
    const [file,setAttachment] = useState(null)
    const [dltTitle,setDltTitle] = useState('')
    const [tableData,setTableData] = useState([])
    const [date,setDate] = useState('')
    const [sections,setSectionsList] = useState([])
    const [section,setSection] = useState('')
    const [studList,setStudList] = useState([])
    const [completed,setCompleted] = useState(false)
    const [remaining,setRemaining] = useState(false)
    const [total,setTotal] = useState('')
    const navigate = useNavigate()
    const {socketConn} = useContext(ChatContext)

    useEffect(()=>{
        async function loadFirst(){
            try{
                const response = await fetch('http://localhost:3000/staff/getMyGrades',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({details: encryptRandom(JSON.stringify({staffName:staffDetails.name,staffGrade: staffDetails.grade}))})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success')
                    setSectionsList(data.list)
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
                alert("Something went wrong!")
            }
            try{
                const toSend = {teacher:staffDetails.name,grade:staffDetails.grade,subject:staffDetails.subject}
                console.log(toSend)
                const response = await fetch('http://localhost:3000/staff/getAssignments',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({details:encryptRandom(JSON.stringify(toSend))})
                })
                const data = await response.json()
                console.log(data)
                if(data.status=='success'){
                    setTableData(data.list)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
                alert("Something went wrong!")
            }
        }
        loadFirst()
    },[])

    const handleTotal = (val) => {
        try{
            if(!isNaN(Number(val))){
                setTotal(val)
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
        }
    }

    useEffect(()=>{
        console.log(total)
    },[total])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(title.trim() !== '' && section.trim() !== '' && total.trim() !== '') {
            try{
                const formData = new FormData();
                formData.append('title', title);
                formData.append('description', description.trim() === "" ? "No Description" : description);
                formData.append('teacher', staffDetails.name);
                formData.append('subject', staffDetails.subject);
                formData.append('section', section);
                formData.append('grade', staffDetails.grade);
                formData.append('total',total)
                if(file !== null) formData.append('file', file);

                const response = await fetch('http://localhost:3000/staff/postAssignment', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                console.log(data);
                alert(data.message);
                navigate(0)
            }
            catch(err){
                console.log(err);
                alert("Something went wrong!");
                return;
            }
        }
        else{
            alert("Please fillup all the fields!");
            return;
        }
    };


    const handleDelete = async () => {
        if(dltTitle.trim() !== '' && date.trim() != ''){
            try{
                const response = await fetch('http://localhost:3000/staff/deleteAssignment',{
                    method: 'DELETE',
                    headers: {"Content-Type": 'application/json'},
                    body: JSON.stringify({
                        details: encryptRandom(
                            JSON.stringify(
                                {
                                    title: dltTitle,
                                    date: new Date(date).toLocaleDateString(),
                                    teacher: staffDetails.name,
                                    grade: staffDetails.grade,
                                    section: staffDetails.section
                                }
                            )
                        )
                    })
                })
                const data = await response.json()
                alert(data.message)
                console.log(data)
            }
            catch(err){
                console.log(err)
                alert('Something went wrong!')
                return
            }
        }
        else{
            alert("Please fill up all the fields to delete!")
            return;
        }
    }

    return (
        <div className='main-body'>
            <h3>Grade: {staffDetails.grade}</h3>
            <form style={{width: '95vw', display: 'flex', flexDirection: 'column'}} onSubmit={handleSubmit}>
                <input style={{width: '300px', padding: '10px', borderRadius: '10px', border: 'none', margin: '10px', outline: '2px solid #1f1f1f'}} type="text" placeholder='Title' onChange={e=>setTitle(e.target.value)} required/>
                <Editor
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Description (Optional)"
                    style={{marginBottom: '1rem', background: 'white', height: "50vh"}}
                />
                <div className='dash-div'>
                    <label>Choose an Attachment for this Assignment (Optional)<input type="file" accept='.docx' onChange={e=>setAttachment(e.target.files[0])}/></label>
                    {
                        sections.sort().map((el,index)=>(
                            <span key={index}>
                                {el}{" "}<input type="radio" name="section" value={el} onChange={e=>setSection(e.target.value)}/>
                            </span>
                        ))
                    }
                    <input type="number" placeholder='Total Marks' onChange={e=>handleTotal(e.target.value)}/>
                    <button type="submit">POST</button>
                </div>
            </form>
            <div className='dash-div'>
                <input placeholder='Assignment Title' onChange={e=>setDltTitle(e.target.value)}/>
                <input placeholder='Date' type="date" onChange={e=>setDate(e.target.value)}/>
                <button onClick={handleDelete}>Delete Assignment</button>
            </div>
            <table className='teacher-timetable' style={{marginBottom: '20px',cursor: 'pointer'}}>
                <thead>
                    <tr>
                        <th style={{color: 'black'}}>Grade</th>
                        <th style={{color: 'black'}}>Section</th>
                        <th style={{color: 'black'}}>Subject</th>
                        <th style={{color: 'black'}}>Title</th>
                        <th style={{color: 'black'}}>Date</th>
                        <th style={{color: 'black'}}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tableData.map((el,index)=>(
                            <tr key={index} onClick={()=>navigate('/assignment-panel',{state:{el}})}>
                                <td style={{color: 'black'}}>{el.grade}</td>
                                <td style={{color: 'black'}}>{el.section}</td>
                                <td style={{color: 'black'}}>{el.subject}</td>
                                <td style={{color: 'black'}}>{el.title}</td>
                                <td style={{color: 'black'}}>{el.date}</td>
                                <td style={{color: 'black'}}><button style={{background: 'transparent', cursor: 'pointer', border: 'none', fontFamily: 'Poppins', fontSize: '1rem'}} onMouseEnter={()=>setCompleted(true)} onMouseLeave={()=>setCompleted(false)}>Show</button></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {socketConn && <StaffChatPanel socket={socketConn} gradeFromLogin={staffDetails.grade} sectionFromLogin={staffDetails.section} myMail={staffDetails.email}/>}
        </div>
    )
}

export default PostAssignment