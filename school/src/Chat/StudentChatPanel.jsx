import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../Context/ChatContext';

const StudentChatPanel = ({ socket, gradeFromLogin, sectionFromLogin, toMail }) => {
    const [grade, setGrade] = useState(gradeFromLogin);
    const [section, setSection] = useState(sectionFromLogin);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [openChat,setOpenChat] = useState(false)
    const inputRef = useRef(null)
    const {notify} = useContext(ChatContext)

    useEffect(()=>{
        if(inputRef?.current){
            inputRef?.current?.focus()
        }
    })

    useEffect(() => {
        if (!socket)
            return;

        const identifyAsStudent = () => {
            socket.send(JSON.stringify({
                type: 'my_name',
                name: sessionStorage.getItem('email'),
                position: 'student',
                grade: grade,
                section: section
            }));
        };

        if(socket.readyState === WebSocket.OPEN){
            identifyAsStudent();
        }
        else{
            socket.addEventListener('open', identifyAsStudent);
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.type === "public_message_from_staff" || data.type === "private_message_from_staff"){
                console.log(data.message)
                setMessages(prev => [...prev, { from: "staff", text: data.message }]);
                notify(data.message,`Staff`)
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
            socket.removeEventListener('open', identifyAsStudent);
        };
    },[socket,grade,section]);

    const handleSend = () => {
        if(!input.trim())
            return;
        const payload = {
            type: "private_msg_to_staff",
            grade: gradeFromLogin,
            section: sectionFromLogin,
            auth: "student",
            message: input,
            to: toMail
        };
        socket.send(JSON.stringify(payload));
        setMessages(prev => [...prev, { from: "me", text: input }]);
        setInput('');
    };

    const handleKey = (e) => {
        if(e.key==='Enter'){
            handleSend()
        }
    }

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            position: 'absolute',
            right: '2.5vw',
            bottom: '1vh',
            zIndex: 100,
            padding: '20px',
            width: '350px',
            
        },
        chatBox: {
            width: '100%',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            padding: '20px',
            animation: 'none',
        },
        setup: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            marginBottom: '1rem',
        },
        toggleButton: {
            flex: 1,
            padding: '0.5rem 1rem',
            borderRadius: '0.8rem',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(to right, blue, #ff2976)',
            color: 'white',
            transition: '0.3s',
            width: 'fit-content',
            margin: '20px',
            fontSize: '0.8rem',
            position: 'fixed',
            left: openChat && '65vw' || '85vw',
            bottom: '2vh',
            boxShadow: 'none'
        },
        chatBox: {
            width: '100%',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            borderRadius: '1.5rem',
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
            padding: '0.5rem'
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
        },
    };

    return (
        <div style={styles.container}>
                <>
                    {
                        !openChat ?
                        <button onClick={()=>setOpenChat(prev=>!prev)} style={styles.toggleButton}>Chat with Staff</button>
                        :
                        <button onClick={()=>setOpenChat(prev=>!prev)} style={styles.toggleButton}>Close</button>
                    }
                    
                    { openChat && <div style={styles.chatBox}>
                        <div style={styles.chatLog}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.message,
                                        alignSelf: msg.from === 'me' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: msg.from === 'me' ? '#ffeaf9ff' : '#e1f5fe',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        maxWidth: '100%',
                                        boxShadow: '0 0 0.5rem rgba(0,0,0,0.1)',
                                        wordWrap: 'break-word',
                                        fontSize: '0.9rem'
                                    }}>
                                        <strong>{msg.from !== 'me' && msg.from.charAt(0).toUpperCase()+'taff' || "You"}: </strong>{msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={styles.inputRow}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type message..."
                                onKeyDown={(e)=>handleKey(e)}
                                style={styles.input}
                                ref={inputRef}
                            />
                            <button style={styles.sendButton} onClick={handleSend}>Send</button>
                        </div>
                    </div>}
                </>
        </div>
    );
};

export default StudentChatPanel;
