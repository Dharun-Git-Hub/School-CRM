import React, { useContext, useEffect, useRef, useState } from 'react';
import './styles.css'
import { ChatContext } from '../Context/ChatContext';

const SuperAdminPanel = ({socket}) => {
    const [gradeAdmins, setGradeAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState('');
    const [mapped,setMapped] = useState([])
    const [openChat,setOpenChat] = useState(false)
    const gradeToEmailMap = Object.fromEntries(mapped.map(item => [item.grade, item.email]));
    const emailToGradeMap = Object.fromEntries(mapped.map(item => [item.email, item.grade]));
    const inputRef = useRef(null)
    const {notify} = useContext(ChatContext)
    
        useEffect(()=>{
            if(inputRef?.current){
                inputRef?.current?.focus()
            }
        })

    useEffect(()=>{
        const fetchList = async () => {
            const response = await fetch('http://localhost:3000/super/retrieveGrades',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({list:gradeAdmins})
            })
            const data = await response.json()
            console.log(data)
            if(data.status==='success'){
                setMapped(data.mapped.map(([email, grade]) => ({ email, grade })));
            }
        }
        if(gradeAdmins.length>0)
            fetchList()
    },[gradeAdmins])

    useEffect(()=>{
        console.log(mapped)
    },[mapped])

    useEffect(()=>{
        if (!socket) return;

        const initializeSuperAdmin = () => {
            socket.send(JSON.stringify({
                type: 'my_name',
                name: 'Dharun',
                position: 'super'
            }));
            socket.send(JSON.stringify({ type: 'get_grade_admins_list' }));
        };

        if(socket.readyState === WebSocket.OPEN){
            initializeSuperAdmin();
        }
        else{
            socket.addEventListener('open', initializeSuperAdmin);
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);

            if(data.type === 'grade_admins_list'){
                console.log(data.list)
                setGradeAdmins(data.list);
            }
            if(data.type === 'private_message_from_grade'){
                const grade = data.from;
                console.log('From',grade)
                console.log('message',data.message)
                const newMessage = { from: grade, message: data.message };
                setMessages(prev => ({
                    ...prev,
                    [grade]: [...(prev[grade] || []), newMessage]
                }));
                notify(data.message,`Grade ${grade} Admin`)
            }
        };
        socket.addEventListener('message', handleMessage);
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    },[socket]);

    const handleSendMessage = () => {
        if(!selectedAdmin || input.trim() === '')
            return;

        const grade = emailToGradeMap[selectedAdmin];
        if(!grade)
            return;
        socket.send(JSON.stringify({
            type: 'private_msg_to_gradeAdmin',
            auth: 'super',
            to: selectedAdmin,
            message: input
        }));
        setMessages(prev => ({
            ...prev,
            [grade]: [...(prev[grade] || []), { from: 'You', message: input }]
        }));
        setInput('');
    };

    const styles = {
        container: {
            width: selectedAdmin ? '60%' : '300px',
            display: 'flex',
            height: '100vh',
            fontFamily: 'Arial, sans-serif',
            position: 'fixed',
            right: '1vw',
            bottom: '1vh',
            flexDirection: 'row-reverse',
            boxShadow: "0 0 2rem silver",
            borderRadius: '1.5rem',
            animation: selectedAdmin && 'open 1s',
            zIndex: '100',
            background: 'white'
        },
        list: {
            listStyleType: 'none',
            padding: '1rem',
            margin: 0,
            width: '300px',
            borderRight: '1px solid #ccc',
            overflowY: 'auto',
            backgroundColor: '#f8f8f8',
            boxShadow: "0 0 1rem silver",
            borderRadius: "1.5rem"
        },
        listItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            borderRadius: '5px',
            marginBottom: '5px',
        },
        avatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            fontWeight: 'bold',
        },
        chatBox: {
            flex: 1,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
        },
        messageArea: {
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            borderRadius: '5px',
            marginBottom: '1rem',
        },
        messageItem: {
            marginBottom: '10px',
            backgroundColor: '#e1f5fe',
            width: 'fit-content',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontFamily: 'Poppins, sans-serif', 
        },
        inputArea: {
            display: 'flex',
            gap: '10px',
        },
        input: {
            flex: 1,
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '10px',
            outline: 'none',
            border: 'none',
        },
        sendButton: {
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        }
    };

    const handleKey = (e) => {
        if(e.key==='Enter'){
            handleSendMessage();
        }
    }

    return (
        <>
            {
                !openChat ?
                    <button className='float-btn' style={{zIndex: '200',position: 'fixed',left: openChat && '95vw', background: openChat && 'black'}} onClick={()=>setOpenChat(prev=>!prev)}>{!openChat ? <i className='bx bx-chat' style={{transform: 'translateY(3px)',fontSize: '1.5rem'}}></i> : 'Close'}</button>
                    :
                <div style={styles.container}>
                    <button className='float-btn-close' style={{zIndex: '200',position: 'fixed',right: openChat && '95vw', background: openChat && 'black'}} onClick={()=>setOpenChat(prev=>!prev)}>{!openChat ? 'Chat' : <i className='bx bx-arrow-back' style={{transform: 'translateY(3px)',fontSize: '1.5rem'}}></i>}</button>
                    <ul style={styles.list}>
                        {gradeAdmins.map((name, index) => {
                            return (
                            <li
                                key={index}
                                style={{
                                ...styles.listItem,
                                background: selectedAdmin === name ? 'linear-gradient(to right,blue,#ff2976)' : '#fff',
                                color: selectedAdmin === name ? 'white' : 'black',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                }}
                                onClick={() => setSelectedAdmin(name)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
                                <span>Grade Admin {emailToGradeMap[name]}</span>
                                </div>
                            </li>
                            );
                        })}
                        </ul>


                    {selectedAdmin && (
                        <div className='list-grade' style={styles.chatBox}>
                            <h3 style={{color:"grey"}}>{selectedAdmin}</h3>
                            <div style={styles.messageArea}>
                                {(messages[emailToGradeMap[selectedAdmin]] || []).map((msg, idx) => (
                                    <div key={idx} style={{...styles.messageItem,
                                    backgroundColor: msg.from === 'You' ? '#f7eefeff' : '#e1f5fe',
                                    position: 'relative',
                                    }}>
                                        <strong>{msg.from}:</strong> {msg.message}
                                    </div>
                                ))}
                            </div>
                            <div style={styles.inputArea}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    style={styles.input}
                                    placeholder="Type your message..."
                                    onKeyDown={(e)=>handleKey(e)}
                                    ref={inputRef}
                                />
                                <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
                            </div>
                        </div>
                    )}
                </div>
            }
        </>
    );
};

export default SuperAdminPanel;
