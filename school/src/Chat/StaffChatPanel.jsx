import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { ChatContext } from '../Context/ChatContext';

const StaffChatPanel = ({socket, gradeFromLogin, sectionFromLogin, myMail}) => {
    const [view, setView] = useState(null);
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState('');
    const [studentList, setStudentList] = useState([])
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [namedStudent,setNamedStudent] = useState([])
    const [toGradeAdmin, setToGradeAdmin] = useState(null);
    const {notify} = useContext(ChatContext)
    console.log(gradeFromLogin)

    const inputRef = useRef(null)
    
    useEffect(()=>{
        if(inputRef?.current){
            inputRef?.current?.focus()
        }
    })

    useEffect(()=>{
        const loadGradeName = async () => {
            try{
                const response = await fetch('http://localhost:3000/staff/loadGradeName',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({details:{gradeFromLogin,sectionFromLogin}})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    setToGradeAdmin(data.list)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
            }
            try{
                const response = await fetch('http://localhost:3000/staff/loadStudentNames',{
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({details: {grade: gradeFromLogin, section: sectionFromLogin}})
                })
                const data = await response.json()
                console.log(data)
                if(data.status==='success'){
                    setNamedStudent(data.list)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
            }
        }
        loadGradeName()
    },[])

    useEffect(()=>{
        if(!socket) return;
        if(namedStudent.length <= 0){
            return
        }
        const identifyAsStaff = () =>{
            socket.send(JSON.stringify({
                type: 'my_name',
                name: sessionStorage.getItem('email'),
                position: 'staff',
                grade: gradeFromLogin,
                section: sectionFromLogin
            }));
        };

        if(socket.readyState === WebSocket.OPEN){
            identifyAsStaff();
        }
        else{
            socket.addEventListener('open', identifyAsStaff);
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.type==="private_message_from_grade"){
                setMessages(prev=>({
                    ...prev,
                    grade: [...(prev.grade|| []),{ from: 'Grade', text: data.message}]
                }))
                notify(data.message,"Grade Admin")
            }
            else if(data.type==="public_message_from_staff"){
                setMessages(prev=>({
                    ...prev,
                    studentPublic: [...(prev.studentPublic || []),{from: 'Student (Public)', text: data.message}]
                }))
            }
            else if(data.type==="private_message_from_student"){
                const studentName = data.from || 'Student';
                console.log(data.from)
                console.log(data.message)
                setMessages(prev => ({
                    ...prev,
                    [studentName]: [...(prev[studentName] || []),{from: studentName, text: data.message}]
                }))
                notify(data.message,`Roll No.: ${namedStudent?.find(el=>el.email===studentName)?.roll}`)
            }
            else if(data.type === 'private_message_from_staff'){
                const studentName = data.to || selectedStudent;
                setMessages(prev => ({
                    ...prev,
                    [studentName]: [...(prev[studentName] || []), {from: 'Me', text: data.message}]
                }))
            }
            else if(data.type === 'students_list'){
                setStudentList(data.list || [])
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
            socket.removeEventListener('open', identifyAsStaff);
        };
    },[socket, gradeFromLogin, selectedStudent,namedStudent]);

    useEffect(()=>{
        if(view === 'student' && socket && gradeFromLogin && sectionFromLogin){
            socket.send(JSON.stringify({
                type: 'get_students_list',
                grade: gradeFromLogin,
                section: sectionFromLogin
            }));
        }
    },[view, socket, gradeFromLogin]);

    const handleSend = () => {
        if(!input.trim()) return;

        let msgPayload;
        if(view === 'grade'){
            msgPayload = {
                message: input,
                type: 'private_msg_to_gradeAdmin',
                auth: 'staff',
                mail: myMail,
                to: toGradeAdmin,
            };
            socket.send(JSON.stringify(msgPayload));
            setMessages(prev => ({
                ...prev,
                grade: [...(prev.grade || []), { from: 'Me', text: input }]
            }));
        }
        else if(view === 'student' && selectedStudent){
            msgPayload = {
                message: input,
                grade: gradeFromLogin,
                section: sectionFromLogin,
                type: 'private_msg_to_student',
                toName: selectedStudent,
            };
            console.log(msgPayload)
            socket.send(JSON.stringify(msgPayload));
            setMessages(prev=>({
                ...prev,
                [selectedStudent]: [...(prev[selectedStudent] || []), { from: "Me", text: input }]
            }));
        }
        else if(view === 'student'){
            msgPayload = {
                message: input,
                grade: gradeFromLogin,
                section: sectionFromLogin,
                type: 'public_msg_to_students'
            };
            console.log(msgPayload)
            socket.send(JSON.stringify(msgPayload));
            setMessages(prev => ({
                ...prev,
                studentPublic: [...(prev.studentPublic || []), { from: "Me", text: input }]
            }));
        }
        setInput('');
    };

    const handleKey = (e) => {
        if(e.key === 'Enter')
            handleSend();
    };

    const styles = {
        container: {
            width: view === 'student' && '600px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            position: 'fixed',
            right: '2.5vw',
            bottom: '1vh',
            zIndex: 100,
            padding: '20px',
        },
        buttonRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            gap: '0.5rem',
        },
        toggleButton: {
            flex: 1,
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.3s',
        },
        chatBox: {
            width: '100%',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 0 2rem silver',
            overflow: 'hidden',
            padding: '20px',
            animation: 'none'
        },
        chatLog: {
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.8rem',
        },
        inputRow: {
            display: 'flex',
            padding: '0.5rem',
        },
        input: {
            flex: 1,
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
        },
        sendButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            marginLeft: '0.5rem',
        },
        message: {
            display: 'flex',
            fontFamily: 'Poppins',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.buttonRow}>
                <button
                    onClick={() => setView('grade')}
                    style={{
                        ...styles.toggleButton,
                        background: view === 'grade' ? 'linear-gradient(to right,blue,#ff2976)' : '#1f1f1f',
                        color: 'white',
                    }}
                >
                    Chat with Grade Admin
                </button>
                <button
                    onClick={()=>setView('student')}
                    style={{
                        ...styles.toggleButton,
                        background: view === 'student' ? 'linear-gradient(to right,blue,#ff2976)' : '#e6e6e6',
                        color: view === 'student' ? 'white' : 'black',
                    }}
                >
                    Chat with Student
                </button>
                {view && <button onClick={()=>setView(null)} style={{cursor: 'pointer', position: 'fixed', left: '1vw', bottom: '5vh', width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#1f1f1f', color: 'white'}}>Close</button>}
            </div>

            {view === 'grade' && (
                <div style={styles.chatBox}>
                    <div style={styles.chatLog}>
                        {(messages.grade || []).map((msg, index) => (
                            <div key={index} style={{
                                ...styles.message,
                                alignSelf: msg.from==='Me'?'flex-end':'flex-start'
                            }}>
                                <div style={{
                                    backgroundColor: msg.from==='Me'?'#ffeaf9ff':'#e1f5fe',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    maxWidth: '100%',
                                    boxShadow: '0 0 0.5rem rgba(0,0,0,0.1)',
                                    wordWrap: 'break-word',
                                    fontFamily: 'Poppins'
                                }}>
                                    <strong>{msg.from}: </strong>{msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={styles.inputRow}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your message..."
                            style={styles.input}
                            onKeyDown={handleKey}
                            ref={inputRef}
                        />
                        <button onClick={handleSend} style={styles.sendButton}>Send</button>
                    </div>
                </div>
            )}
            {view === 'student' && (
                <div style={{ display: 'flex', width: '100%', height: '400px' }}>
                    <ul style={{
                        listStyleType: 'none',
                        padding: '1rem',
                        margin: 0,
                        width: '200px',
                        borderRight: '1px solid #ccc',
                        overflowY: 'auto',
                        backgroundColor: '#f8f8f8',
                        boxShadow: "0 0 1rem silver",
                        borderRadius: "1.5rem 0 0 1.5rem"
                    }}>
                        {namedStudent.map((student, idx) => (
                            <li
                                key={student.roll || idx}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: selectedStudent === student.email ? 'linear-gradient(to right,blue,#ff2976)' : '#fff',
                                    color: selectedStudent === student.email ? 'white' : 'black',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                }}
                                onClick={() => setSelectedStudent(student.email)}
                            >
                                Roll Number: {student.roll}
                            </li>
                        ))}
                        <li
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                background: !selectedStudent ? 'linear-gradient(to right,blue,#ff2976)' : '#fff',
                                color: !selectedStudent ? 'white' : 'black',
                                borderRadius: '5px',
                                marginBottom: '5px',
                            }}
                            onClick={() => setSelectedStudent(null)}
                        >
                            All Students (Public)
                        </li>
                    </ul>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '0 1.5rem 1.5rem 0', boxShadow: '0 0 2rem silver', padding: '20px' }}>
                        <div style={styles.chatLog}>
                            {(selectedStudent ? (messages[selectedStudent] || []) : (messages.studentPublic || [])).map((msg, index) => (
                                <div key={index} style={{
                                    ...styles.message,
                                    alignSelf: msg.from === 'Me' ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        backgroundColor: msg.from === 'Me' ? '#ffeaf9ff' : '#e1f5fe',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        maxWidth: '100%',
                                        boxShadow: '0 0 0.5rem rgba(0,0,0,0.1)',
                                        wordWrap: 'break-word',
                                    }}>
                                        {msg.from !== 'Me' ? <strong>{namedStudent.find(el=>el.email === msg.from).roll}: </strong> : <strong>{msg.from}: </strong>}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={styles.inputRow}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={selectedStudent ? `Message... ${namedStudent.find(el=>el.email === selectedStudent).roll}` : "Message..."}
                                style={styles.input}
                                onKeyDown={handleKey}
                                ref={inputRef}
                            />
                            <button onClick={handleSend} style={styles.sendButton}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffChatPanel;
