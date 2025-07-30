import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption';
import { ChatContext } from '../../Context/ChatContext';
import StaffChatPanel from '../../Chat/StaffChatPanel';

const AssignmentPanel = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const pageData = location.state.el || {};
    console.log(pageData)
    const [compare,setComparator] = useState({})
    const [gained,setGained] = useState({})
    const [total,setTotal] = useState(pageData.total ? pageData.total.toString() : "")
    const [opened,setOpened] = useState(false)
    const {socketConn} = useContext(ChatContext)

    useEffect(()=>{
        console.log(gained)
    },[gained])

    useEffect(()=>{
        const getRemains = async () => {
            const dtls = JSON.stringify({
                grade: pageData.grade,
                subject: pageData.subject,
                section: pageData.section,
                teacher: pageData.teacher,
                date: pageData.date,
                title: pageData.title,
            })
            try{
                const response = await fetch('http://localhost:3000/staff/getRemaining',{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({details:encryptRandom(dtls)}),
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    setComparator(data.list)
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
        getRemains()
    },[pageData])

    const handleGain = (e,el) => {
        setOpened(true)
        if(!isNaN(e.target.value) && Number(total)>0){
            let temp = gained;
            temp[el.student] = {name: el.student, roll: el.roll, gained: Number(e.target.value), total: Number(total)}
            console.log(temp)
            setGained(temp)
        }
    }

    const assignMarks = async (el) => {
        if(!opened){
            alert('First assign a mark to post!')
            return
        }
        try{
            if(total.trim() === ''){
                alert("Please enter a total value")
                return
            }
            else if(Number(total)<=0){
                alert("Please enter a valid total value")
                return;
            }
            for(const i of Object.values(gained)){
                console.log(i)
                if(i.gained > i.total){
                    alert(`Please assign a mark lesser than ${i.total}`)
                    return;
                }
            }
            const dtls = {
                teacher: pageData.teacher,
                grade: pageData.grade,
                subject: pageData.subject,
                section: pageData.section,
                title: pageData.title,
                date: pageData.date,
                gained
            }
            const response = await fetch('http://localhost:3000/staff/assignMarks',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({details:encryptRandom(JSON.stringify(dtls))})
            })
            const data = await response.json();
            console.log(data)
            if(data.status==='success'){
                alert(data.message)
                navigate(-1)
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

    const handleFeedback = (el,e) => {
        let temp = gained;
        temp[el.student].feedback = e.target.value;
        setGained(temp)
    }

    return (
        <>
        <span className='welcome-note'>Assignment Panel</span>
        <div style={{display:"grid", gridTemplateColumns: "repeat(2,1fr)"}}>
            <div className='assignment-div' style={{minWidth: '40vw', justifyContent: 'center'}}>
                <div>
                    <span className='title-div'>Title:</span><span>{pageData.title}</span>
                </div>
                <div>
                    <span>Description</span>
                    <span dangerouslySetInnerHTML={{__html:pageData.description}}></span>
                </div>
                <div>
                    <span>Grade: </span>
                    <span>{pageData.grade} - {pageData.section}</span>
                </div>
                <div>
                    <span>Subject: </span>
                    <span>{pageData.subject}</span>
                </div>
                <div>{pageData.date}</div> 
            </div>
            <div style={{display:'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{marginTop: '10px',fontFamily: 'Poppins'}}>Completed:</div>
                <ul className='list-completed'>
                {
                    pageData.submissions.map((el,index)=>(
                        <li key={index}>
                            Name : <span>{el.student}</span>
                            Roll: <span>{el.roll}</span>
                            Status: {el.submitted ? <span style={{color: "green"}}>Submitted</span> : <span style={{color: "red"}}>Pending</span>}
                            File: <a href={URL.createObjectURL(new Blob([new Uint8Array(el.attachment.data)],{type: "application/*"}))} download={`${el.student}_${el.roll}_${pageData.title}_Assignment.pdf`}>View</a>
                            Marks: <input value={gained[el.student.gained]} type="number" placeholder={el.marks ? el.marks : `Marks out of ${total}`} disabled={el.marks} onChange={(e)=>handleGain(e,el)}/>
                            Feedback: <div><textarea placeholder={el.feedback ? el.feedback : 'Your Feedback on the Assignment'} onChange={e=>handleFeedback(el,e)} disabled={el.feedback}></textarea></div>
                        </li>
                    ))
                }
                </ul>
                <br/>
                <button className='assign-button' disabled={pageData.submissions.length<=0} onClick={assignMarks}>Assign Marks</button>
            </div> 
            <div style={{display: 'flex',flexDirection:'column',gap:"10px", margin: '10px'}}>
                <h2>Incomplete:</h2>
                <strong>{pageData.submissions.length} out of {compare?.total?.length} Student(s) Completed</strong>
                <ul className='list-completed' style={{width:'40vw',marginTop:'10px',margin: '-15px'}}>
                    {
                        compare?.incomplete?.map((el,index)=>(
                            <li key={index}>
                                Name : <span>{el.name}{" "}</span>
                                Roll: <span>{el.roll}</span>
                                Status: <span>{el.submitted ? <span style={{color: "red"}}>Incomplete</span> : <span style={{color: "red"}}>Pending</span>}</span>
                            </li>
                        ))
                    }
                </ul>
            </div>
            {socketConn && pageData.grade.trim() !== '' && <StaffChatPanel socket={socketConn} gradeFromLogin={pageData.grade} sectionFromLogin={pageData.section} myMail={pageData.email}/>}
        </div>
        </>
    )
}

export default AssignmentPanel