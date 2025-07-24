import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption';

const AssignmentPanel = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const pageData = location.state.el || {};
    console.log(pageData)
    const [compare,setComparator] = useState({})
    const [gained,setGained] = useState({})
    const [total,setTotal] = useState(pageData.total ? pageData.total.toString() : "")

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
        if(!isNaN(e.target.value) && Number(total)>0){
            let temp = gained;
            temp[el.student] = {name: el.student, roll: el.roll, gained: Number(e.target.value), total: Number(total)}
            console.log(temp)
            setGained(temp)
        }
    }

    const assignMarks = async (el) => {
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
        <div>
            Assignment Panel
            <h2>{pageData.title}</h2>
            <h3>
                <span dangerouslySetInnerHTML={{__html:pageData.description}}></span>
            </h3>
            <h4>Grade - {pageData.grade}</h4>
            <h5>Subject - {pageData.subject}</h5>
            <h6>{pageData.date}</h6>
            <h2>Completed:</h2>
            <ul>
                {
                    pageData.submissions.map((el,index)=>(
                        <li key={index}>
                            Name : {el.student}
                            Roll: {el.roll}
                            Status: {el.submitted ? <span style={{color: "green"}}>Submitted</span> : <span style={{color: "red"}}>Pending</span>}
                            File: <a href={URL.createObjectURL(new Blob([new Uint8Array(el.attachment.data)],{type: "application/*"}))} download={`${el.student}_${el.roll}_${pageData.title}_Assignment.pdf`}>View</a>
                            Marks: <input value={gained[el.student.gained]} type="number" placeholder={el.marks ? el.marks : 'Marks'} disabled={el.marks} onChange={(e)=>handleGain(e,el)}/> for {total}
                            Feedback: <textarea placeholder={el.feedback ? el.feedback : 'Your Feedback on the Assignment'} onChange={e=>handleFeedback(el,e)} disabled={el.feedback}></textarea>
                            <strong>{pageData.submissions.length}</strong> out of {compare?.total?.length} Student(s) Completed
                        </li>
                    ))
                }
            </ul>
            <button onClick={assignMarks}>Assign Marks</button>
            <input placeholder={total} value={total} disabled/>
            <h2>Incomplete:</h2>
            <ul>
                {
                    compare?.incomplete?.map((el,index)=>(
                        <li key={index}>
                            Name : {el.name}{" "}
                            Roll: {el.roll}
                            Status: {el.submitted ? <span style={{color: "red"}}>Incomplete</span> : <span style={{color: "red"}}>Pending</span>}
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default AssignmentPanel