import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChatContext } from '../../Context/ChatContext'
import GradeAdminPanel from '../../Chat/GradeAdminPanel'

const GradeTimeSlots = () => {
    const location = useLocation()
    const myGrade = location.state || ''
    console.log(myGrade)
    const [sectionList,setSections] = useState([])
    const [navData,setNavData] = useState({})
    const [gradeId,setGradeId] = useState('')
    const [sectionId,setSectionId] = useState('')
    const [academicYear,setAcademicYear] = useState('')
    const navigate = useNavigate()
    const {socketConn} = useContext(ChatContext)

    useEffect(()=>{
        const getSection = async () => {
            const response = await fetch('http://localhost:3000/grade/getSections',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({details:myGrade})
            })
            const data = await response.json();
            console.log(data)
            if(data.status==='success'){
                setSections(data.list)
            }
            else{
                alert(data.message)
            }
        }
        getSection()
    },[])

    useEffect(()=>{
        setNavData({
            myGrade,
            sectionId,
            academicYear,
        })
        console.log(navData)
    },[myGrade,sectionId,academicYear])

    const goToScheduler = () => {
        for(const el of sectionList){
            const exists = sectionList.filter(e=>e.grade === myGrade)
            console.log(exists)
            const proceed = exists.some(e=>sectionId === e.name)
            if(!proceed){
                alert('Not a valid Section!')
                return
            }
        }
        if(myGrade.trim() !== '' && sectionId.trim() !== '' && academicYear){
            navigate('/timetable',{state: navData})
        }
        else{
            alert('Fill up all the details to create a timetable!')
            return
        }
    }

    return (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',overflow:'auto',scrollBehavior:'smooth'}}>
            <div className='slots-cont'>
                <input placeholder='Grade' list="grade-list" value={myGrade} disabled/>
                <input placeholder='Section' list="list-sections" value={sectionId} onChange={e=>setSectionId(e.target.value)}/>
                <datalist id="list-sections">
                    {
                        sectionList.map((el, index) => (
                                <option key={index} value={el.name}>{el.name}</option>
                            ))
                    }
                </datalist>
                <input type='date' placeholder='Academic Year' onChange={e=>setAcademicYear(e.target.value)}/>
                <button onClick={goToScheduler}>Schedule Timetable</button>
                {socketConn && myGrade.trim() !== '' && <GradeAdminPanel socket={socketConn} grade={myGrade}/>}
            </div>
            
        </div>
    )
}

export default GradeTimeSlots