import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../Context/ChatContext';

const GradeAdminPanel = ({ socket, grade }) => {
    const [view, setView] = useState(null);
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [namedStaff,setNamedStaff] = useState([])
    const {notify} = useContext(ChatContext)
    const inputRef = useRef(null)
    
    useEffect(()=>{
        if(inputRef?.current){
            inputRef?.current?.focus()
        }
    })
    
    useEffect(()=>{
        console.log(grade)
    },[grade]);

    useEffect(()=>{
        const loadStaffNames = async () => {
            try{
                const response = await fetch('http://localhost:3000/grade/getStaffNames',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({theGrade:grade})
                })
                const data = await response.json();
                console.log(data)
                if(data.status==='success'){
                    setNamedStaff(data.list)
                }
                else{
                    alert(data.message)
                }
            }
            catch(err){
                console.log(err)
            }
        }
        loadStaffNames()
    },[])

    useEffect(() => {
        if (!socket) return;
        if(namedStaff.length <= 0){
            return
        }
        const identifyAsGradeAdmin = () => {
            socket.send(JSON.stringify({
                type: 'my_name',
                name: sessionStorage.getItem('email'),
                position: 'grade',
                grade: grade,
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
            if(data.type === "private_message_from_super"){
                setMessages(prev => ({
                    ...prev,
                    super: [...(prev.super || []), { from: "S.A.", text: data.message }]
                }));
                console.log('Sent')
                notify(data.message,'Super Admin')
            } 
            else if(data.type === "public_message_from_grade"){
                setMessages(prev => ({
                    ...prev,
                    staffPublic: [...(prev.staffPublic || []), { from: "Grade Admin (Public)", text: data.message }]
                }));
            } 
            else if(data.type === "private_message_from_staff"){
                const staffName = data.from || "Staff";
                console.log(staffName)
                console.log(data.message)
                setMessages(prev => ({
                    ...prev,
                    [staffName]: [...(prev[staffName] || []), { from: staffName, text: data.message }]
                }));
                notify(data.message,`Grade: ${grade}-${namedStaff.find(el => el.email === staffName)?.section}`)
            }
            else if(data.type === "private_message_from_grade"){
                const staffName = data.to || selectedStaff;
                
                setMessages(prev => ({
                    ...prev,
                    [staffName]: [...(prev[staffName] || []), { from: "Me", text: data.message }]
                }));
            }
            else if(data.type === "staff_list"){
                setStaffList(data.list || []);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () =>{
            socket.removeEventListener('message', handleMessage);
            socket.removeEventListener('open', identifyAsGradeAdmin);
        };
    },[socket, grade, selectedStaff,namedStaff]);

    useEffect(()=>{
        if(view === 'staff' && socket && grade){
            socket.send(JSON.stringify({type: 'get_staff_list',grade}));
        }
    },[view, socket, grade]);

    const handleSend = () => {
        if(!input.trim())
            return;

        if(view === 'super'){
            const msgPayload = {
                message: input,
                grade,
                type: "private_msg_to_super",
            };
            socket.send(JSON.stringify(msgPayload));
            setMessages(prev => ({
                ...prev,
                super: [...(prev.super || []), { from: "Me", text: input }]
            }));
        }
        else if(view === 'staff' && selectedStaff){
            const msgPayload = {
                message: input,
                grade,
                type: "private_msg_to_staff",
                auth: 'grade',
                to: selectedStaff,
            };
            socket.send(JSON.stringify(msgPayload));
            setMessages(prev=>({
                ...prev,
                [selectedStaff]: [...(prev[selectedStaff] || []), { from: "Me", text: input }]
            }));
        }
        else if(view === 'staff'){
            const msgPayload = {
                message: input,
                grade,
                type: "public_msg_to_staff",
            };
            socket.send(JSON.stringify(msgPayload));
            setMessages(prev => ({
                ...prev,
                staffPublic: [...(prev.staffPublic || []), { from: "Me", text: input }]
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
            width: view==='staff' && '600px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            position: 'fixed',
            right: '2.5vw',
            bottom: '1vh',
            zIndex: 100,
            padding: '20px',
            scrollBehaviour: 'smooth'
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
            animation: 'none',
            scrollBehaviour: 'smooth'
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
                    onClick={() => setView('super')}
                    style={{
                        ...styles.toggleButton,
                        background: view === 'super' ? 'linear-gradient(to right,blue,#ff2976)' : '#1f1f1f',
                        color: 'white',
                    }}
                >
                    Chat with Super Admin
                </button>
                <button
                    onClick={() => setView('staff')}
                    style={{
                        ...styles.toggleButton,
                        background: view === 'staff' ? 'linear-gradient(to right,blue,#ff2976)' : '#e6e6e6',
                        color: view === 'staff' ? 'white' : 'black',
                        border: '2px solid silver'
                    }}
                >
                    Chat with Staff
                </button>
                {view && <button onClick={()=>setView(null)} style={{cursor: 'pointer', position: 'fixed', left: '1vw', bottom: '5vh', width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#1f1f1f', color: 'white'}}>Close</button>}
            </div>

            {view === 'super' && (
                <div style={styles.chatBox}>
                    <div style={styles.chatLog}>
                        {(messages.super || []).map((msg, index) => (
                            <div key={index} style={{
                                ...styles.message,
                                alignSelf: msg.from === 'Me' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    backgroundColor: msg.from === 'Me' ? '#ffeaf9ff' : '#e1f5fe',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    maxWidth: '80%',
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
                            ref={inputRef}
                        />
                        <button onClick={handleSend} style={styles.sendButton}>Send</button>
                    </div>
                </div>
            )}

            {view === 'staff' && (
                <div style={{ display: 'flex', width: '100%', height: '400px' }}>
                    <ul style={{
                        listStyleType: 'none',
                        padding: '1rem',
                        margin: 0,
                        width: '150px',
                        borderRight: '1px solid #ccc',
                        overflowY: 'auto',
                        backgroundColor: '#f8f8f8',
                        boxShadow: "0 0 1rem silver",
                        borderRadius: "1.5rem 0 0 1.5rem"
                    }}>
                        {staffList.map((name, idx) => (
                            <li
                                key={idx}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: selectedStaff === name ? 'linear-gradient(to right,blue,#ff2976)' : '#fff',
                                    color: selectedStaff === name ? 'white' : 'black',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                }}
                                onClick={() => setSelectedStaff(name)}
                            >
                                Staff {grade}-{namedStaff.find(el => el.email === name)?.section || name}
                            </li>
                        ))}
                        
                    </ul>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '0 1.5rem 1.5rem 0', boxShadow: '0 0 2rem silver', padding: '20px' }}>
                        <div style={styles.chatLog}>
                            {(selectedStaff ? (messages[selectedStaff] || []) : (messages.staffPublic || [])).map((msg, index) => (
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
                                        {msg.from !== 'Me' ? <strong>{grade} {namedStaff.find(el => el.email === msg.from)?.section || msg.from}: </strong> : <strong>{msg.from}: </strong>}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={styles.inputRow}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={selectedStaff ? `Message... ${grade} - ${namedStaff.find(el => el.email === selectedStaff)?.section}` : "Message..."}
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

export default GradeAdminPanel;
