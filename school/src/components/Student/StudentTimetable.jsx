import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { encryptRandom } from "../../Security/Encryption";
import { ToastContainer,toast } from "react-toastify";

const StudentTimetable = ({details}) => {
    const [openform, setOpenForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [staffDetails, setStaffDetails] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6];
    const startTimes = ["9.30AM", "10.30AM", "11.30AM", "12.30PM", "2.15PM", "3.15PM"];
    const endTimes = ["10:30AM", "11.30AM", "12.30PM", "1.30PM", "3.15PM", "4.15PM"];
    console.log(details)

    const fetchTimetable = async () => {
        if(!details.grade || !details.section) return;
        try {
            const response = await fetch('http://localhost:3000/student/getTimeline',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details:encryptRandom(JSON.stringify({
                    gradeId: details.grade,
                    sectionId: details.section
                }))})
            });
            const data = await response.json();
            console.log(data)
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
        fetchTimetable();
    },[]);

    const getSlotDetails = (day, period) => {
       console.log(
        timetable.find((slot) => slot.timeslots?.day === day && parseInt(slot.timeslots?.period) === parseInt(period))
       )
        return timetable.find((slot) =>
            slot.timeslots?.day === day &&
            parseInt(slot.timeslots?.period) === parseInt(period)
        );
    };

    const handleToast = (txt) => {
        if(txt.trim() === '') return
        toast(txt)
    }

    return (
        <div style={{ padding: "20px", fontFamily: 'Poppins' }}>
            <h2 style={{color: 'gr#333ey',fontSize: '1.2rem'}}>Grade:</h2>{details.grade}
            <h3>Section: {details.section}</h3>
            
            <table className="teacher-timetable" border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                    {days.map((day, dayIndex) => (
                        <tr style={{marginLeft: '200px'}} key={dayIndex}>
                            <td style={{boxShadow: 'none', marginRight: '20px', border:'0.5px solid rgba(200,200,200,0.2)', cursor: 'pointer'}}><strong>{day}</strong></td>
                            {periods.map((period, pIndex) => {
                                const detailsSlot = getSlotDetails(day, period);
                                return (
                                    <td
                                        className={detailsSlot && "d3-tab"}
                                        key={pIndex}
                                        style={{
                                            background: !detailsSlot && 'transparent',
                                            color: "white",
                                            boxShadow: 'none',
                                            cursor: detailsSlot ? 'pointer' : 'pointer',
                                            textAlign: 'center',
                                            minWidth: "120px",
                                            width: '150px',
                                        }}
                                        onClick={()=>handleToast(detailsSlot !== undefined ?
                                            `${detailsSlot.timeslots?.teacher} - ${detailsSlot.timeslots?.subject}\n${detailsSlot.timeslots?.startTime} - ${detailsSlot.timeslots?.endTime}`
                                            : '')}
                                        title={
                                            detailsSlot !== undefined ?
                                            `${detailsSlot.timeslots?.teacher} - ${detailsSlot.timeslots?.subject}\n${detailsSlot.timeslots?.startTime} - ${detailsSlot.timeslots?.endTime}`
                                            : ''
                                        }>
                                        {detailsSlot ? (
                                            <div>
                                                <div style={{margin: '10px'}}><strong style={{color: '#fff'}}>{detailsSlot?.gradeID === details.grade ? detailsSlot.timeslots?.subject : ""}</strong></div>
                                                <div style={{ fontSize: "0.5rem" }}>{detailsSlot.gradeID === details.grade? detailsSlot.timeslots?.startTime +" - "+ detailsSlot.timeslots?.endTime : ""}</div>
                                            </div>
                                        ) : ''}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <ToastContainer position="bottom-center" toastStyle={{background:'#1f1f1f',color:'#fff'}} closeButton={false}/>
        </div>
    );
};

export default StudentTimetable;
