import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GradeTimeSlots = () => {
    const [gradeList,setGradeList] = useState([])
    const [sectionList,setSections] = useState([])
    const [navData,setNavData] = useState({})
    const [gradeId,setGradeId] = useState('')
    const [sectionId,setSectionId] = useState('')
    const [academicYear,setAcademicYear] = useState('')
    const navigate = useNavigate()

    useEffect(()=>{
        const getGrade = async () => {
            const response = await fetch('http://localhost:3000/grade/getGrades')
            const data = await response.json();
            console.log(data)
            if(data.status==='success'){
                setGradeList(data.list)
            }
            else{
                alert(data.message)
            }
        }
        const getSection = async () => {
            const response = await fetch('http://localhost:3000/grade/getSections')
            const data = await response.json();
            console.log(data)
            if(data.status==='success'){
                setSections(data.list)
            }
            else{
                alert(data.message)
            }
        }
        getGrade()
        getSection()
    },[])

    useEffect(()=>{
        setNavData({
            gradeId,
            sectionId,
            academicYear,
        })
    },[gradeId,sectionId,academicYear])

    const goToScheduler = () => {
        const exists = gradeList.some(el=>el===gradeId)
        if(!exists){
            alert('Please select a valid Grade from the list!')
            return
        }
        for(const el of sectionList){
            const exists = sectionList.filter(e=>e.grade === gradeId)
            console.log(exists)
            const proceed = exists.some(e=>sectionId === e.name)
            if(!proceed){
                alert('Not a valid Section!')
                return
            }
        }
        if(gradeId.trim() !== '' && sectionId.trim() !== '' && academicYear){
            navigate('/timetable',{state: navData})
        }
        else{
            alert('Fill up all the details to create a timetable!')
            return
        }
    }

    return (
        <div>
            <input placeholder='Grade' list="grade-list" onChange={e=>setGradeId(e.target.value)}/>
            <datalist id="grade-list">
                {
                    gradeList.map((el,index)=>(
                        <option key={index} value={el}>{el}</option>
                    ))
                }
            </datalist>
            <input placeholder='Section' list="list-sections" value={sectionId} onChange={e=>setSectionId(e.target.value)}/>
            <datalist id="list-sections">
                {
                    sectionList
                        .filter(el => el.grade === gradeId)
                        .map((el, index) => (
                            <option key={index} value={el.name}>{el.name}</option>
                        ))
                }
            </datalist>
            <input type='date' placeholder='Academic Year' onChange={e=>setAcademicYear(e.target.value)}/>
            <button onClick={goToScheduler}>Schedule Timetable</button>
        </div>
    )
}

export default GradeTimeSlots