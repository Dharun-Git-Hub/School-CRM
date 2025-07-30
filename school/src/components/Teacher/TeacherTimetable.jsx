import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { encryptRandom } from "../../Security/Encryption";

const TeacherTimetable = ({details}) => {
    const [openform, setOpenForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [staffDetails, setStaffDetails] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6];
    const startTimes = ["9.30AM", "10.30AM", "11.30AM", "12.30PM", "2.15PM", "3.15PM"];
    const endTimes = ["10:30AM", "11.30AM", "12.30PM", "1.30PM", "3.15PM", "4.15PM"];
    console.log(details.name)

    const getStaffDetails = async () => {
        try {
            const info = {
                grade: details.gradeId,
                section: details.sectionId,
            };
            console.log(info)
            const response = await fetch('http://localhost:3000/grade/getStaff',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details: encryptRandom(JSON.stringify(info))})
            });
            const data = await response.json();
            if(data.status==='success'){
                setStaffDetails(data.list)
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
        if(!details.gradeId || !details.sectionId) return;
        try {
            const response = await fetch('http://localhost:3000/staff/getTimeline',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({details:encryptRandom(JSON.stringify({
                    gradeId: details.gradeId,
                    sectionId: details.sectionId
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
        getStaffDetails();
        fetchTimetable();
    },[]);

    const getSlotDetails = (day, period) => {
        console.log(timetable.find((slot) =>
                slot.timeslots?.day === day &&
                parseInt(slot.timeslots?.period) === parseInt(period) &&
                slot.timeslots?.teacher === details.name
        ))
        return timetable.find((slot) =>
                slot.timeslots?.day === day &&
                parseInt(slot.timeslots?.period) === parseInt(period) &&
                slot.timeslots?.teacher === details.name
        );
    };

    return (
        <div style={{ padding: "20px", fontFamily: 'Poppins' }}>
            <h1>Timetable</h1>
            <h2 style={{color: 'gr#333ey',fontSize: '1.2rem'}}>Grade:</h2>{details.gradeId}
            <h3>Section: {details.sectionId}</h3>
            
            <table className="teacher-timetable" border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                                        style={{
                                            backgroundColor: detailsSlot ? '#d3d3d3' : 'white',
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
                                            <>
                                                <div style={{margin: '10px'}}><strong style={{color: '#333'}}>{detailsSlot.timeslots?.subject === details.subject ? "Grade: "+detailsSlot.gradeID : ""} -</strong></div>
                                                <div style={{ fontSize: "1rem" }}>{detailsSlot.timeslots?.teacher === details.name? detailsSlot.sectionID : ""}</div>
                                            </>
                                        ) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherTimetable;
