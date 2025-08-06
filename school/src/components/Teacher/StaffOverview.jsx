import { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption'

const StaffOverview = () => {
    const location = useLocation()
    const details = location.state || null
    const [subjects,setSubjects] = useState([])
    const [students,setStudents] = useState([])
    const [sections,setSections] = useState([])
    const [view,setView] = useState('student')

    const [studentCurrent,setStudentCurrent] = useState(2)
    const [studentSkip,setStudentSkip] = useState(0)
    const [subjectSkip,setSubjectSkip] = useState(0)
    const [subjectCurrent,setSubjectCurrent] = useState(2)
    const [sectionSkip,setSectionSkip] = useState(0)
    const [sectionCurrent,setSectionCurrent] = useState(2)
    
    const [studentPage,setStudentPage] = useState(1);
    const [subjectPage,setSubjectPage] = useState(1);
    const [sectionPage,setSectionPage] = useState(1)

    const handleClick = async(email) => {
        navigator.clipboard.writeText(email)
        toast(`Email Copied to Clipboard! ❤️`)
    }

    const getOverStudents = async () => {
        try{
            const temp = encryptRandom(JSON.stringify({skip:studentSkip,limit:studentCurrent,grade:details.myGrade,section:details.mySection}))
            const response = await axios.post('http://localhost:3000/staff/getOverStudents',{
                details: temp
            })
            console.log(response.data)
            setStudents(prev => prev.length !== 0 ? [...response.data.list] : response.data.list)
            if(response.data.list.length===0){
                toast.info('That\'s it!')
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
        }
    }

    const getOverSubjects = async () => {
        try{
            const temp = encryptRandom(JSON.stringify({skip:subjectSkip,limit:subjectCurrent,grade:details.myGrade,section:details.mySection}))
            const response = await axios.post('http://localhost:3000/staff/getOverSubjects',{
                details: temp
            })
            console.log(response.data)
            setSubjects(prev => prev.length !== 0 ? [...response.data.list] : response.data.list)
            if(response.data.list.length===0){
                toast.info('That\'s it!')
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
        }
    }

    const getOverSections = async () => {
        try{
            const temp = encryptRandom(JSON.stringify({skip:sectionSkip,limit:sectionCurrent,grade:details.myGrade,section:details.mySection}))
            const response = await axios.post('http://localhost:3000/staff/getOverSections',{
                details: temp
            })
            console.log(response.data)
            setSections(prev => prev.length !== 0 ? [...response.data.list] : response.data.list)
            if(response.data.list.length===0){
                toast.info('That\'s it!')
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
        }
    }

    useEffect(()=>{
        getOverStudents()
    },[studentCurrent,studentSkip])
    useEffect(()=>{
        getOverSubjects()
    },[subjectCurrent,subjectSkip])
    useEffect(()=>{
        getOverSections()
    },[sectionCurrent,sectionSkip])

    const handleStudent = async (val = 1) => {
        let newPage = studentPage;
        let newSkip = studentSkip;
        if(val === -1 && studentPage-1 <= 0)
            return;
        if(val === -1){
            newPage = studentPage - 1;
            newSkip = studentSkip - studentCurrent;
        }
        else{
            newPage = studentPage + 1;
            newSkip = studentSkip + studentCurrent;
        }
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:subjectCurrent,grade:details.myGrade,section:details.mySection}))
        try{
            const response = await axios.post('http://localhost:3000/staff/getOverStudents',{
                details: temp
            });
            if(response.data.list.length===0){
                toast.info("That's it!");
                return;
            }
            setStudents(response.data.list);
            setStudentPage(newPage);
            setStudentSkip(newSkip);

        }
        catch(err){
            console.error(err);
            toast.error("Something went wrong!");
        }
    };

    const handleSubject = async (val = 1) => {
        let newPage = subjectPage;
        let newSkip = subjectSkip;
        if(val === -1 && subjectPage-1 <= 0)
            return;
        if(val === -1){
            newPage = subjectPage - 1;
            newSkip = subjectSkip - subjectCurrent;
        }
        else{
            newPage = subjectPage + 1;
            newSkip = subjectSkip + subjectCurrent;
        }
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:subjectCurrent,grade:details.myGrade,section:details.mySection}))
        try{
            const response = await axios.post('http://localhost:3000/staff/getOverSubjects',{
                details: temp
            });
            if(response.data.list.length===0){
                toast.info("That's it!");
                return;
            }
            setSubjects(response.data.list);
            setSubjectPage(newPage);
            setSubjectSkip(newSkip);
        }
        catch(err){
            console.error(err);
            toast.error("Something went wrong!");
        }
    };

    const handleSection = async (val = 1) => {
        let newPage = sectionPage;
        let newSkip = sectionSkip;
        if(val === -1 && sectionPage-1 <= 0)
            return;
        if(val === -1){
            newPage = sectionPage - 1;
            newSkip = sectionSkip - sectionCurrent;
        }
        else{
            newPage = sectionPage + 1;
            newSkip = sectionSkip + sectionCurrent;
        }
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:subjectCurrent,grade:details.myGrade,section:details.mySection}))
        try{
            const response = await axios.post('http://localhost:3000/staff/getOverSections',{
                details: temp
            });
            if(response.data.list.length===0){
                toast.info("That's it!");
                return;
            }
            setSections(response.data.list);
            setSectionPage(newPage);
            setSectionSkip(newSkip);
        }
        catch(err){
            console.error(err);
            toast.error("Something went wrong!");
        }
    };

    const alertPanel = async () => {
        alert((await navigator.clipboard.readText(0)))
    }

    return (
        <div>
            <div className='float-btn2' style={{position:'fixed',borderRadius:'0',display:'flex',flexDirection:'column'}}>
                <button className={view === 'student' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>setView('student')}>Students</button>
                <button className={view === 'section' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>setView('section')}>Sections</button>
                <button className={view === 'subject' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>setView('subject')}>Subjects</button>
            </div>
            <div className='secondary'>
                {
                view === 'student' &&
                <>
                <span className='welcome-note' id='student-note'>Students</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Roll</th>
                        <th>Academic Year</th>
                        <th>Admission Number</th>
                        <th>DOB</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        students.sort((a,b)=>a.grade-b.grade).map((el,index)=>(
                            <tr key={index}>
                                <td>{el.name}</td>
                                <td>{el.grade}</td>
                                <td>{el.section}</td>
                                <td>{el.roll}</td>
                                <td>{el.academic_year}</td>
                                <td>{el.admission_no}</td>
                                <td>{new Date(el.dob).toLocaleDateString()}</td>
                                <td style={{cursor: 'pointer'}} onClick={()=>handleClick(el.email)} title={el.email}>{el.email}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <button className='loader' onClick={()=>handleStudent(-1)}><i className='bx bx-arrow-back'></i></button>
            <span className='page-no'>{studentPage}</span>
            <button className='loader' onClick={()=>handleStudent()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
            {
                view === 'section' &&
                <><span className='welcome-note' id='section-note'>Sections</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Students</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sections.sort((a,b)=>a.grade-b.grade).map((el,index)=>(
                            <tr key={index}>
                                <td>{el.grade}</td>
                                <td>{el.name}</td>
                                <td>{el.students.map(e=>(e.name+", "))}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <button className='loader' onClick={()=>handleSection(-1)}><i className='bx bx-arrow-back'></i></button>
            <span className='page-no'>{sectionPage}</span>
            <button className='loader' onClick={()=>handleSection()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
            { view === 'subject' && 
            <><span className='welcome-note' id='subject-note'>Subjects</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Subject Code</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        subjects?.sort((a,b)=>a.name.localeCompare(b.name)).map((el,index)=>(
                            <tr key={index}>
                                <td>{el.name}</td>
                                <td>{el.code}</td>
                                <td>{el.grade+", "}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <button className='loader' onClick={()=>handleSubject(-1)}><i className='bx bx-arrow-back'></i></button>
            <span className='page-no'>{subjectPage}</span>
            <button className='loader' onClick={()=>handleSubject()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
            </div>
            <ToastContainer autoClose={100} position='top-center' toastStyle={{background:'rgba(1,1,1,0.9)', color:'#fff'}} onClick={alertPanel}/>
        </div>
    )
}

export default StaffOverview