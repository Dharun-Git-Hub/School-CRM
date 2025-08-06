import { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'
import { encryptRandom } from '../../Security/Encryption'

const GradeOverview = () => {
    const location = useLocation()
    const myGrade = location.state || null
    const [subjects,setSubjects] = useState([])
    const [grades,setGrades] = useState([])
    const [staff,setStaff] = useState([])
    const [students,setStudents] = useState([])
    const [sections,setSections] = useState([])
    const [view,setView] = useState('grade')

    const [gradeSkip,setGradeSkip] = useState(0)
    const [gradeCurrent,setGradeCurrent] = useState(2)
    const [staffSkip,setStaffSkip] = useState(0)
    const [staffCurrent,setStaffCurrent] = useState(2)
    const [studentSkip,setStudentSkip] = useState(0)
    const [studentCurrent,setStudentCurrent] = useState(2)
    const [subjectSkip,setSubjectSkip] = useState(0)
    const [subjectCurrent,setSubjectCurrent] = useState(2)
    const [sectionSkip,setSectionSkip] = useState(0)
    const [sectionCurrent,setSectionCurrent] = useState(2)

    const [gradePage,setGradePage] = useState(1);
    const [staffPage,setStaffPage] = useState(1);
    const [studentPage,setStudentPage] = useState(1);
    const [subjectPage,setSubjectPage] = useState(1);
    const [sectionPage,setSectionPage] = useState(1)

    const handleClick = (email) => {
        navigator.clipboard.writeText(email)
        toast(`Email Copied to Clipboard! ❤️`)
    }

    const getOverStudents = async () => {
        try{
            const temp = encryptRandom(JSON.stringify({skip:studentSkip,limit:studentCurrent,grade:myGrade}))
            const response = await axios.post('http://localhost:3000/grade/getOverStudents',{
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

    const getOverTeachers = async () => {
        try{
            const temp = encryptRandom(JSON.stringify({skip:staffSkip,limit:staffCurrent,grade:myGrade}))
            const response = await axios.post('http://localhost:3000/grade/getOverTeachers',{
                details: temp
            })
            console.log(response.data)
            setStaff(prev => prev.length !== 0 ? [...response.data.list] : response.data.list)
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
            const temp = encryptRandom(JSON.stringify({skip:subjectSkip,limit:subjectCurrent,grade:myGrade}))
            const response = await axios.post('http://localhost:3000/grade/getOverSubjects',{
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

    const getOverGrades = async () => {
        try{
            const temp = encryptRandom(JSON.stringify({skip:gradeSkip,limit:gradeCurrent,grade:myGrade}))
            const response = await axios.post('http://localhost:3000/grade/getOverGrades',{
                details: temp
            })
            console.log(response.data)
            setGrades(prev => prev.length !== 0 ? [...response.data.list] : response.data.list)
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
            const temp = encryptRandom(JSON.stringify({skip:sectionSkip,limit:sectionCurrent,grade:myGrade}))
            const response = await axios.post('http://localhost:3000/grade/getOverSections',{
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
        getOverGrades()
    },[gradeCurrent,gradeSkip])
    useEffect(()=>{
        getOverTeachers()
    },[staffCurrent,staffSkip])
    useEffect(()=>{
        getOverStudents()
    },[studentCurrent,studentSkip])
    useEffect(()=>{
        getOverSubjects()
    },[subjectCurrent,subjectSkip])
    useEffect(()=>{
        getOverSections()
    },[sectionCurrent,sectionSkip])

    const handleGrade = async (val = 1) => {
        let newPage = gradePage;
        let newSkip = gradeSkip;
        if(val === -1 && gradePage-1 <= 0)
            return;
        if(val === -1){
            newPage = gradePage - 1;
            newSkip = gradeSkip - gradeCurrent;
        }
        else{
            newPage = gradePage + 1;
            newSkip = gradeSkip + gradeCurrent;
        }
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:gradeCurrent,grade:myGrade}))
        try{
            const response = await axios.post('http://localhost:3000/grade/getOverGrades',{
                details: temp
            });
            if(response.data.list.length===0){
                toast.info("That's it!");
                return;
            }
            setGrades(response.data.list);
            setGradePage(newPage);
            setGradeSkip(newSkip);

        }
        catch(err){
            console.error(err);
            toast.error("Something went wrong!");
        }
    };

    const handleStaff = async (val = 1) => {
        let newPage = staffPage;
        let newSkip = staffSkip;
        if(val === -1 && staffPage-1 <= 0)
            return;
        if(val === -1){
            newPage = staffPage - 1;
            newSkip = staffSkip - staffCurrent;
        }
        else{
            newPage = staffPage + 1;
            newSkip = staffSkip + staffCurrent;
        }
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:staffCurrent,grade:myGrade}))
        try{
            const response = await axios.post('http://localhost:3000/grade/getOverTeachers',{
                details: temp
            });
            if(response.data.list.length===0){
                toast.info("That's it!");
                return;
            }
            setStaff(response.data.list);
            setStaffPage(newPage);
            setStaffSkip(newSkip);
        }
        catch(err){
            console.error(err);
            toast.error("Something went wrong!");
        }
    };

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
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:studentCurrent,grade:myGrade}))
        try{
            const response = await axios.post('http://localhost:3000/grade/getOverStudents',{
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
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:subjectCurrent,grade:myGrade}))
        try{
            const response = await axios.post('http://localhost:3000/grade/getOverSubjects',{
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
        const temp = encryptRandom(JSON.stringify({skip:newSkip,limit:sectionCurrent,grade:myGrade}))
        try{
            const response = await axios.post('http://localhost:3000/grade/getOverSections',{
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
            <div className='float-btn2' style={{position:'fixed',display:'flex',flexDirection:'column'}}>
                <button className={view === 'grade' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>{setView('grade')}}>Grades</button>
                <button className={view === 'staff' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>{setView('staff')}}>Staff</button>
                <button className={view === 'student' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>{setView('student')}}>Students</button>
                <button className={view === 'section' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>{setView('section')}}>Sections</button>
                <button className={view === 'subject' ? 'float-btn-selected' : 'float-btn-not-selected'} onClick={()=>{setView('subject')}}>Subjects</button>
            </div>
            <div className='secondary'>
        {
                view === 'staff' &&
                <>
                <span className='welcome-note' id='staff-note'>Staff</span>
            <table  style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        staff.sort((a,b)=>a.grade-b.grade).map((el,index)=>(
                            <tr key={index}>
                                <td>{el.name}</td>
                                <td>{el.grade}</td>
                                <td>{el.section}</td>
                                <td>{el.email}</td>
                                <td>{el.subject}</td>
                                <td>{el.phone}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <button className='loader' onClick={()=>handleStaff(-1)}><i className='bx bx-arrow-back'></i></button>
            <span className="page-no">{staffPage}</span>
            <button className='loader' onClick={()=>handleStaff()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
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
            <span className="page-no">{studentPage}</span>
            <button className='loader' onClick={()=>handleStudent()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
            {
                view === 'grade' &&
                <>
                <span className='welcome-note' id='grade-note'>Grades</span>
            <table style={{width: 'fit-content',borderRadius:'10px', boxShadow:'0 0 13px silver'}}  className='teacher-timetable2'>
                <thead>
                    <tr>
                        <th>Grade</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        grades.sort((a,b)=>a.grade-b.grade).map((el,index)=>(
                            <tr key={index}>
                                <td>{el.grade}</td>
                                <td>{el.description}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <button className='loader' onClick={()=>handleGrade(-1)}><i className='bx bx-arrow-back'></i></button>
            <span className="page-no">{gradePage}</span>
            <button className='loader' onClick={()=>handleGrade()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
            {
                view === 'section' &&
                <>
                <span className='welcome-note' id='section-note'>Sections</span>
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
            <span className="page-no">{sectionPage}</span>
            <button className='loader' onClick={()=>handleSection()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>
            }
            {
                view === 'subject' &&
                <>
                <span className='welcome-note' id='subject-note'>Subjects</span>
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
                        subjects.sort((a,b)=>a.name.localeCompare(b.name)).map((el,index)=>(
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
            <span className="page-no">{subjectPage}</span>
            <button className='loader' onClick={()=>handleSubject()}><i style={{transform:'rotate(180deg)'}} className='bx bx-arrow-back'></i></button>
            </>}
            </div>
            
            <ToastContainer position='top-center' autoClose={100} toastStyle={{background:'rgba(1,1,1,0.9)', color:'#fff'}} onClick={alertPanel}/>
        </div>
    )
}

export default GradeOverview