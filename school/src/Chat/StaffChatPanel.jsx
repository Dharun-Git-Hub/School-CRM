import React, { useEffect, useState, useCallback } from 'react';

const StaffChatPanel = ({ socket, gradeFromLogin, sectionFromLogin, myMail }) => {
    const [view, setView] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [toGradeAdmin, setToGradeAdmin] = useState(null);
    console.log(gradeFromLogin)

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
        }
        loadGradeName()
    },[])

    useEffect(()=>{
        if(!socket) return;
        const identifyAsGradeAdmin = () =>{
            socket.send(JSON.stringify({
                type: 'my_name',
                name: sessionStorage.getItem('email'),
                position: 'staff',
                grade: gradeFromLogin,
                section: sectionFromLogin
            }));
        };

        if(socket.readyState === WebSocket.OPEN){
            identifyAsGradeAdmin();
        }
        else{
            socket.addEventListener('open', identifyAsGradeAdmin);
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.type==="private_message_from_grade"){
                setMessages(prev => [...prev, { from: "Grade", text: data.message }]);
            }
            else if(data.type==="public_message_from_grade"){
                setMessages(prev => [...prev, { from: "Grade Admins (Public)", text: data.message }]);
            }
            else if(data.type==="private_message_from_staff"){
                setMessages(prev => [...prev, { from: "Staff", text: data.message }]);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
            socket.removeEventListener('open', identifyAsGradeAdmin);
        };
    },[socket, gradeFromLogin]);

    const handleSend = () => {
        if(!input.trim())
            return;

        let msgPayload;
        if(view === 'grade'){
            msgPayload = {
                message: input,
                type: 'private_msg_to_gradeAdmin',
                auth: 'staff',
                mail: myMail,
                to: toGradeAdmin,
            };
        }
        else{
            msgPayload = {
                message: input,
                grade: gradeFromLogin,
                type: "public_msg_to_student",
            };
        }
        socket.send(JSON.stringify(msgPayload));
        setMessages(prev => [...prev, { from: "Me", text: input }]);
        setInput('');
    };


    const handleKey = (e) => {
        if(e.key === 'Enter')
            handleSend();
    };

    return (
        <div style={styles.container}>
            <div style={styles.buttonRow}>
                <button
                    onClick={() => setView('grade')}
                    style={{
                        ...styles.toggleButton,
                        background: view === 'grade' ? 'linear-gradient(to right,blue,#ff2976)' : '#e6e6e6',
                        color: view === 'grade' ? 'white' : 'black',
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
            </div>

            {view && (
                <div style={styles.chatBox}>
                    <div style={styles.chatLog}>
                        {messages.map((msg, index) => (
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
                        />
                        <button onClick={handleSend} style={styles.sendButton}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        position: 'absolute',
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

export default StaffChatPanel;
