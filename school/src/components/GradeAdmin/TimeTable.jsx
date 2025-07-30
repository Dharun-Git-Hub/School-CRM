import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { encryptRandom } from '../../Security/Encryption';
import { ChatContext } from '../../Context/ChatContext';
import GradeAdminPanel from '../../Chat/GradeAdminPanel';

const Timetable = () => {
    const location = useLocation();
    const details = location.state || {};
    console.log(details)
    const [openform, setOpenForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [staffDetails, setStaffDetails] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6];
    const startTimes = ["9.30AM", "10.30AM", "11.30AM", "12.30PM", "2.15PM", "3.15PM"];
    const endTimes = ["10:30AM", "11.30AM", "12.30PM", "1.30PM", "3.15PM", "4.15PM"];
    const {socketConn} = useContext(ChatContext)

    const getStaffDetails = async () => {
        try{
            const info = {
                grade: details.myGrade,
                section: details.sectionId,
            };
            const response = await fetch('http://localhost:3000/grade/getStaff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details: encryptRandom(JSON.stringify(info)) })
            });
            const data = await response.json();
            if(data.status === 'success'){
                setStaffDetails(data.list);
            }
            else{
                alert(data.message);
            }
        }
        catch(err){
            alert('Something went wrong!');
            console.log(err);
        }
    };

    const fetchTimetable = async () => {
        if(!details.myGrade || !details.sectionId || !details.academicYear) return;
        try{
            const response = await fetch('http://localhost:3000/grade/getTimeline', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details:encryptRandom(JSON.stringify({
                    gradeId: details.myGrade,
                    sectionId: details.sectionId
                }))})
            });
            const data = await response.json();
            if(data.status === 'success'){
                console.log(data.list)
                setTimetable(data.list);
            }
            else{
                alert(data.message);
            }
        }
        catch(err){
            console.error(err);
        }
    };

    useEffect(() => {
        getStaffDetails();
        fetchTimetable();
    },[]);

    const extract = async (day, period, startTime, endTime) => {
        const exists = getSlotDetails(day, period);
        setFormData({day, period, startTime, endTime});
        setOpenForm(true);
    };

    const getSlotDetails = (day, period) => {
        console.log(timetable.find((slot) =>
                slot.timeslots?.day === day &&
                parseInt(slot.timeslots?.period) === parseInt(period)
        ))
        return timetable.find((slot) =>
                slot.timeslots?.day === day &&
                parseInt(slot.timeslots?.period) === parseInt(period)
        );
    };

    const OpenedForm = () => {
        const [staff, setStaff] = useState('');
        const [subject, setSubject] = useState('');

        useEffect(()=>{
            const match = staffDetails.find(el => el.name === staff);
            setSubject(match?.subject);
        },[staff]);

        const schedulePeriod = async () => {
            if(!staff || !subject){
                alert("Please select staff");
                return;
            }
            const scheduleData = {
                gradeID: details.myGrade,
                sectionID: details.sectionId,
                academicYear: details.academicYear.split("-")[0],
                timeslots: {
                    day: formData.day,
                    period: formData.period,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    subject: subject,
                    teacher: staff
                },
                createdAt: new Date()
            };

            try{
                const res = await fetch("http://localhost:3000/grade/addTimeline", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        details: encryptRandom(JSON.stringify(scheduleData))
                    })
                });

                const data = await res.json();
                alert(data.message);
                if(data.status === 'success'){
                    setOpenForm(false);
                    fetchTimetable();
                }
            }
            catch(err){
                alert("Failed to schedule!");
                console.error(err);
            }
        };

        return (
            <div className='forgot-cont' style={{ fontFamily: 'Poppins', width: 'fit-content',gap: '0px', marginTop: '20px', border: '1px solid silver', boxShadow: "0 0 0.3rem silver", borderRadius: '10px', padding: '10px', height: 'fit-content' }}>
                <h3 className='welcome-note'>Schedule Period</h3>
                <p>Day: {formData.day}, Period: {formData.period}</p>
                <p>Time: {formData.startTime} - {formData.endTime}</p>
                <input style={{background:"#ddd",border: 'none'}} value={details.myGrade} disabled /><br />
                <input style={{background:"#ddd",border: 'none'}} value={details.sectionId} disabled /><br />
                <input style={{background:"#ddd",border: 'none'}} value={details.academicYear.split("-")[0]} disabled /><br />
                <label>Staff:</label>
                <input list="list-staff" placeholder='Staff' onChange={e => setStaff(e.target.value)} />
                <datalist id="list-staff">
                    {staffDetails.map((el, index) => (
                        <option key={index} value={el.name} />
                    ))}
                </datalist>
                <br />
                <label>Subject: </label>
                <input value={subject || ''} disabled /><br />
                <button onClick={schedulePeriod}>Schedule</button>
            </div>
        );
    };

    const handleRetain = async(details) => {
        console.log('Delete Request',details)
        const opt = confirm("Are you want to delete this ?")
        if(!opt) return
        try{
            const encrypted = encryptRandom(JSON.stringify(details))
            const response = await fetch('http://localhost:3000/grade/deleteTimeline',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({toRetain:encrypted}),
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success'){
                fetchTimetable()
                alert(data.message)
                return;
            }
            else{
                alert(data.message);
                return
            }
        }
        catch(err){
            console.log(err)
            alert('Something went wrong!')
            return
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{fontFamily:'Poppins'}}>Timetable</h1>
            <h2>Grade: {details.myGrade}</h2>
            <h3>Section: {details.sectionId}</h3>
            <h4>Academic Year: {details.academicYear.split("-")[0]} - {Number(details.academicYear.split("-")[0]) + 1}</h4>
            <table className='teacher-timetable' border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Day / Period</th>
                        {periods.map((p, i) => (
                            <th key={i} style={{ textAlign: "center" }}>Period {p}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map((day, dayIndex) => (
                        <tr key={dayIndex}>
                            <td><strong>{day}</strong></td>
                            {periods.map((period, pIndex) => {
                                const detailsSlot = getSlotDetails(day, period);
                                return (
                                    <td
                                        key={pIndex}
                                        onClick={()=> !detailsSlot && extract(day, period, startTimes[pIndex], endTimes[pIndex])}
                                        style={{
                                            backgroundColor: detailsSlot ? '#d3d3d3' : 'white',
                                            boxShadow: detailsSlot && 'none',
                                            color: "black",
                                            cursor: detailsSlot ? 'default' : 'pointer',
                                            textAlign: 'center',
                                            minWidth: "120px"
                                        }}
                                        title={
                                            detailsSlot
                                                ? `${detailsSlot.timeslots?.teacher} - ${detailsSlot.timeslots?.subject}\n${detailsSlot.timeslots?.startTime} - ${detailsSlot.timeslots?.endTime}`
                                                : ''
                                        }
                                    >
                                        {detailsSlot ? (
                                            <div>
                                                <div><strong>{detailsSlot.timeslots?.subject}</strong></div>
                                                <div style={{ fontSize: "0.8em" }}>{detailsSlot.timeslots?.teacher}</div>
                                                <button style={{margin: '5px', background:'transparent',padding: '3px',color: 'red',border: 'none', cursor: 'pointer', borderRadius:"5px"}} onClick={()=>handleRetain(detailsSlot)}><i className='bx bx-trash'></i></button>
                                            </div>
                                        ) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {socketConn && details?.myGrade?.trim() !== '' && <GradeAdminPanel socket={socketConn} grade={details?.myGrade}/>}
            {openform && <OpenedForm />}
        </div>
    );
};

export default Timetable;
